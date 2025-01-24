# Script to update or re-create IP addresses for conditional forwarders

# Define parameters for the forwarders
$ForwarderNames = @("technews.com", "biznews.com", "bankease.com", "iciciibank.com", "swgaudit.com", "xn--microsof-epb.com", "infoman.com")
$NewIPAddress = "10.200.2.106"  # New IP address to add

# Import DNS Server module
Import-Module DNSServer

foreach ($ForwarderName in $ForwarderNames) {
    Write-Host "Processing forwarder: $ForwarderName" -ForegroundColor Cyan

    try {
        # Attempt to add or update the conditional forwarder
        Write-Host "Re-creating or updating forwarder: $ForwarderName" -ForegroundColor Yellow
        Add-DnsServerConditionalForwarderZone -Name $ForwarderName -MasterServers $NewIPAddress -PassThru -ErrorAction Stop
        Write-Host "Successfully updated forwarder: $ForwarderName with IP $NewIPAddress" -ForegroundColor Green
    } catch {
        # If forwarder exists, fallback to updating
        Write-Host "Forwarder already exists. Updating with new IP: $NewIPAddress" -ForegroundColor Yellow
        Set-DnsServerConditionalForwarderZone -Name $ForwarderName -MasterServers $NewIPAddress
        Write-Host "Updated forwarder: $ForwarderName successfully" -ForegroundColor Green
    }
}

Write-Host "Script execution completed." -ForegroundColor Green
