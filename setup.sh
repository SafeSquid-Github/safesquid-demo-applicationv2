#!/bin/bash

# Define Variables
# HOSTS=("iciciibank.com" "infoman.com" "bankease.com" "technews.com" "swgaudit.com" "xn--microsof-epb.com" "businessnews.com")
CERTS_DIR="/etc/ssl/certs"
KEYS_DIR="/etc/ssl/private"
DAYS_VALID=3650
BIND9_ZONE_DIR="/etc/bind/zones"
BIND9_LOG_DIR="/var/log/named"
BIND9_QUERY_LOG="$BIND9_LOG_DIR/query.log"
ROOT_CA_DIR="/etc/ssl/rootca"
ROOT_CA_KEY="${ROOT_CA_DIR}/rootCA.key"
ROOT_CA_CERT="${ROOT_CA_DIR}/rootCA.pem"

# Declare an associative arraya
declare -A HOSTS

GET_HOSTS () 
{
    # Run the command to get names and ports and store them in the associative array
    while IFS= read -r line; do
        APP_NAME=$(echo "$line" | cut -d':' -f1).com
        APP_PORT=$(echo "$line" | cut -d':' -f2)
        HOSTS["$APP_NAME"]="$APP_PORT"
    done < <(node -e 'console.log(JSON.stringify(require("./ecosystem.config.js")))' | jq -r '.apps[] | "\(.name):\(.env_development.PORT // .env_production.PORT)"')
}

# Function to Install Dependencies
INSTALL_DEPENDENCIES () 
{
    echo "Installing dependencies"
    
    # Update package list and install dependencies
    apt-get update
    apt-get install -y bind9 bind9utils bind9-doc monit sqlite3 apache2 openssl nodejs npm jq
    npm install -g pm2

    # Enable Apache SSL and headers modules
    a2enmod proxy proxy_http rewrite ssl proxy_balancer php8.3 headers

    echo "Dependencies installed successfully."
}

# Function to Create Folders and Set Permissions
CREATE_FOLDERS_AND_PERMISSIONS () 
{
    echo "Creating necessary directories and setting permissions"

    # Create the directory for the SQLite database if it doesn't exist
    mkdir -p /var/db/demo

    # Create the necessary directories for Bind9 (zone files, logs)
    mkdir -p $BIND9_ZONE_DIR
    mkdir -p $BIND9_LOG_DIR

    # Set ownership and permissions for Bind9 directories
    chown -R bind:bind $BIND9_ZONE_DIR
    chown -R bind:bind $BIND9_LOG_DIR
    chmod -R 755 $BIND9_ZONE_DIR
    chmod -R 700 $BIND9_LOG_DIR

    # Set ownership and permissions for the SQLite database
    chown bind:bind $SQLITE_DB
    chmod 644 $SQLITE_DB

    echo "Directories created and permissions set successfully."
}

# Function to Create Root Certificate Authority (Root CA)
CREATE_ROOT_CA () 
{
    echo "Creating Root Certificate Authority (Root CA)"

    # Create a directory for the Root CA if it doesn't exist
    [[ ! -d ${ROOT_CA_DIR} ]] && mkdir -p $ROOT_CA_DIR

    # Check if Root CA certificate exists and is valid
    [[ -f "$ROOT_CA_CERT" && -f "$ROOT_CA_KEY" ]] && openssl x509 -checkend 0 -noout -in "$ROOT_CA_CERT" 2>/dev/null
    local RESULT=$?
    [[ $RESULT == 0 ]] && echo "CA Certificate is valid. Skipping generation." && return
    [[ $RESULT != 0 ]] && echo "CA Certificate is expired or invalid. Regenerating."

    # Generate the Root CA private key (without passphrase)
    openssl genpkey -algorithm RSA -out ${ROOT_CA_KEY}

    # Generate the Root CA certificate (self-signed) with SafeSquid Labs as the issuer name
    openssl req -key ${ROOT_CA_KEY} -new -x509 -out ${ROOT_CA_CERT} -days $DAYS_VALID \
        -subj "/CN=SafeSquid Labs Root CA/O=SafeSquid Labs/OU=Root CA/C=US"  # Modify this line to include OU

    # Set correct permissions for the Root CA files
    chown root:root $ROOT_CA_KEY $ROOT_CA_CERT
    chmod 600 $ROOT_CA_KEY
    chmod 644 $ROOT_CA_CERT

    echo "Root CA created successfully."
}

# Function to Verify Certificate with Root CA
VERIFY_CERTIFICATE_WITH_ROOT_CA () 
{
    local CERT_FILE=$1
    echo "Verifying certificate: $CERT_FILE against Root CA: $ROOT_CA_CERT"
    openssl verify -CAfile "$ROOT_CA_CERT" "$CERT_FILE" > /dev/null 2>&1
    local RESULT=$?
    [[ $RESULT == 2 ]] && echo "Certificate verification failed for $CERT_FILE" && return 1   
    [[ $RESULT == 0 ]] && echo "Certificate verification successful for $CERT_FILE" && return 0
}

# Function to Generate a Single Wildcard SSL Certificate
GENERATE_CERTIFICATES_FOR_HOSTNAMES () 
{
    CREATE_ROOT_CA
    echo "Generating SSL certificates for each hostname"

    for HOSTNAME in "${!HOSTS[@]}" 
    do
        CERT_FILE="${CERTS_DIR}/${HOSTNAME}.pem"
        KEY_FILE="${KEYS_DIR}/${HOSTNAME}.key"

        [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]] && openssl x509 -checkend 0 -noout -in "$CERT_FILE" 2>/dev/null
        local RESULT=$?
        [[ $RESULT == 0 ]] && echo "Certificate for $HOSTNAME is valid. Skipping generation." && VERIFY_CERTIFICATE_WITH_ROOT_CA ${CERT_FILE} && continue
        [[ $RESULT != 0 ]] && echo "Certificate for $HOSTNAME expired or invalid. Regenerating."

        echo "Generating SSL certificate and private key for ${HOSTNAME} and *.${HOSTNAME}"

        # Generate CSR and private key
        openssl req -new -newkey rsa:4096 -keyout "$KEY_FILE" -out "${CERT_FILE}.csr" -nodes -subj "/CN=${HOSTNAME}" -addext "subjectAltName = DNS:${HOSTNAME},DNS:*.${HOSTNAME}"

        # Sign the CSR using the Root CA
        openssl req -x509 -in "${CERT_FILE}.csr" -CA "$ROOT_CA_CERT" -CAkey "$ROOT_CA_KEY" -CAcreateserial -out "$CERT_FILE" -days "$DAYS_VALID" -sha256 -copy_extensions copy

        # Clean up CSR
        rm -f "${CERT_FILE}.csr"

        [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]] && echo "Certificate for $HOSTNAME generated successfully."
        [[ ! -f "$CERT_FILE" && ! -f "$KEY_FILE" ]] && echo "Error: Failed to generate SSL certificate for $HOSTNAME." && exit 1
    done

    echo "Certificates for all hostnames generated successfully."
}

# Function to generate Apache configuration
GENERATE_APACHE_CONF () 
{
    for HOSTNAME in "${!HOSTS[@]}"; do
        local port=${HOSTS[$HOSTNAME]}
        local ssl_cert="/etc/ssl/certs/${HOSTNAME}.pem"
        local ssl_key="/etc/ssl/private/${HOSTNAME}.key"
        local error_log="${APACHE_LOG_DIR}/${HOSTNAME}_error.log"
        local access_log="${APACHE_LOG_DIR}/${HOSTNAME}_access.log"
        local VHOST_CONF="/etc/apache2/sites-available/${HOSTNAME}.conf"
        cat <<EOF > "$VHOST_CONF"
# Auto-generated Apache configuration for $HOSTNAME

# Redirect HTTP to HTTPS for all HOSTS
<VirtualHost *:80>
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName $HOSTNAME
    SSLEngine on
    SSLCertificateFile $ssl_cert
    SSLCertificateKeyFile $ssl_key

    ProxyPass "/" "http://localhost:$port/"
    ProxyPassReverse "/" "http://localhost:$port/"

    ErrorLog $error_log
    CustomLog $access_log combined
</VirtualHost>

EOF
        # Enable the virtual host
		a2ensite "${HOSTNAME}.conf"
		echo "Virtual host for ${HOSTNAME} created and enabled."
	done

    echo "Apache configuration generated in $VHOST_CONF"

	# Restart Apache to apply the changes
	echo "Restarting Apache"
	systemctl restart apache2 && echo "Apache restarted successfully."
}

# Function to Setup Bind9 DNS Server for Multiple HOSTS with Dynamic IP Address
# Function to Setup Bind9 DNS Server for Hostnames in HOSTS with Dynamic IP Address
SETUP_BIND9_DNS () 
{
    echo "Setting up Bind9 DNS server for the following hostnames: ${!HOSTS[*]}"

    # Get the host's IP address (assuming it's the primary IP on eth0 or ens3)
    HOST_IP=$(hostname -I | awk '{print $1}')

    # Check if the IP was successfully retrieved
    [[ -z "$HOST_IP" ]] && echo "Error: Could not retrieve the host's IP address." && exit 1

    echo "Host IP address is: $HOST_IP"

    # Create Bind9 zones directory if it doesn't exist
    BIND9_ZONE_DIR="/etc/bind/zones"
    mkdir -p "$BIND9_ZONE_DIR"

    # Loop through each hostname and create its zone file
    for HOSTNAME in "${!HOSTS[@]}"; do
        echo "Creating zone file for $HOSTNAME"

        ZONE_FILE="$BIND9_ZONE_DIR/db.$HOSTNAME"
        cat << EOF > "$ZONE_FILE"
\$TTL    86400
@       IN      SOA     ns1.$HOSTNAME. root.$HOSTNAME. (
                        1        ; Serial
                        3600     ; Refresh
                        1800     ; Retry
                        1209600  ; Expire
                        86400 )  ; Minimum TTL

        IN      NS      ns1.$HOSTNAME.
ns1     IN      A       $HOST_IP

; A record for $HOSTNAME domain
@       IN      A       $HOST_IP

; A record for www.$HOSTNAME
www     IN      A       $HOST_IP

; Wildcard record for *.$HOSTNAME
*       IN      A       $HOST_IP
EOF

        echo "Zone file for $HOSTNAME created."

        # Check if zone already exists in named.conf.local
        if ! grep -q "zone \"$HOSTNAME\"" /etc/bind/named.conf.local; then
            echo "Adding zone for $HOSTNAME to Bind9 configuration"
            cat << EOF >> /etc/bind/named.conf.local
zone "$HOSTNAME" {
    type master;
    file "$ZONE_FILE";
};
EOF
        else
            echo "Zone for $HOSTNAME already exists in Bind9 configuration."
        fi
    done

    # Add logging configuration if not already present
    if ! grep -q 'channel query_log' /etc/bind/named.conf.local; then
        echo "Adding logging configuration to Bind9"
        cat << EOF >> /etc/bind/named.conf.local
logging {
    channel query_log {
        file "/var/log/named/query.log" versions 5 size 10m;
        severity info;
        print-time yes;
        print-severity yes;
        print-category yes;
    };
    category queries { query_log; };
};
EOF
    else
        echo "Logging configuration already exists in Bind9 configuration."
    fi

    # Restart Bind9 service to apply changes
    systemctl restart bind9

    echo "Bind9 DNS server configured and restarted."
}

# Main Function to Run All Setup
MAIN () 
{
    INSTALL_DEPENDENCIES
    CREATE_FOLDERS_AND_PERMISSIONS
    GET_HOSTS
    GENERATE_CERTIFICATES_FOR_HOSTNAMES
    GENERATE_APACHE_CONF
    SETUP_BIND9_DNS

    pm2 start ./ecosystem.config.js --env development --watch
    pm2 save

    echo "Setup completed successfully."
}

# Run the main function
MAIN