const form = document.createElement('form');
form.id = 'contactSupportForm';
form.action = 'https://{{qoomStationDomain}}/survey/reportaccountissue';
form.method = 'POST';
form.enctype = 'multipart/form-data';
form.style.display = 'none';
form.innerHTML = `
	<input id='domain' type='hidden' name='domain' value=''>
	<input id='errorMessage' type='hidden' name='errorMessage' value=''>
	<input id='formSubmitBtn' type='submit' value='submit' style='display:none;'>
`;

function sendUsMessage(domain, message) {
	document.querySelector('#contactSupportForm #domain').value = location.origin;
	document.querySelector('#contactSupportForm #errorMessage').value =  message;
	document.querySelector('#contactSupportForm #formSubmitBtn').click();
}

function checkIfMessageSent() {
	try {
		const sp = new URLSearchParams(location.search);
		if(!['true', 'false'].includes(sp.get('messagesent'))) return;

		if(sp.get('messagesent')) {
			
		} else {
			
		}
		
		sp.delete('messagesent');
		const newPath = location.pathname.split('?')[0] + '?' + sp.toString();
		window.history.pushState('', '', newPath);
	} catch(ex) {
		
	}
}

function showSendingMessageResult(elementId) {
	
}


document.body.appendChild(form);
checkIfMessageSent();