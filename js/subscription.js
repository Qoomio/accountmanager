import Modal from '/libs/modal/script.js';

var togglePaymentCycleBtn = document.querySelector('input[name=toggleSwitch]')
	, latestSubscriptionPlanId = document.querySelector('#latestSubscriptionId').value
	, cancellationComplete = false
	, keepClicked = false
	, stripe = Stripe('{{stripeToken}}')
	, elements = stripe.elements()
	, style = {
base: {
	fontSize: '16px',
	color: '#32325d',
	},
}
	, card = elements.create('card', {style: style})
	, addNew = document.querySelector('#addNew')
	, $adminLink = document.querySelector('#takeMeToAdminPageLink')
	, codingspacerowTemplate = document.querySelector('#codingspacerow').innerHTML
	, $codingspacebody = document.querySelector('#memberTable tbody')
	, entity = location.href.split('/')[4] || ''
	, homeAdminAddress = document.querySelector('.home .gotoadmin')
	, codingspaces = {{CODINGSPACES}}
	, entityDomain = '{{entity.domain}}'
	, plansize = {{PLANSIZE}}
	, updateto
	, previousCodingSpaces
	, subscriberEmail = '{{email}}'
	, $openUpdatePaymentModal = document.getElementById('openUpdatePaymentModal')
	, $openCancelPlanModal = document.getElementById('openCancelPlanModal')
	, $keepMyPlanBtn = document.getElementById('keepMyPlanBtn')
	, domainCanceled = {{domainCanceled}}
	, domainExpired = {{domainExpired}}
;

let validators = {
	notEmpty: function(v) {
		return !!(v && v.length)
	}
}
	
const $updatePaymentModal = new Modal({
	modalContainerId: 'updatePaymentModal'
	, modalTitleText: `Update Payment Method`
	, modalContentsInnerHTML: `<div class="col-lg-12 modal-description">
				Enter a new credit/debit card info.
			</div>
			<div class="col-lg-12 credit-card-input-container">
                <div class="form-input">
					<div id="card-element">
					<!-- A Stripe Element will be inserted here. -->
					</div>
					<!-- Used to display Element errors. -->
					<div id="card-errors" role="alert"></div>
                </div> <!-- form input -->
            </div>
            `
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Update'
	, modalCancelBtnAction: function() {
		$updatePaymentModal.destroy();
	}
	, modalSubmitBtnAction: updatePaymentMethod
})

const $cancelPlanModalStepOne = new Modal({
	modalContainerId: 'cancelPlanModal'
	, modalTitleText: `Cancel My Plan`
	, modalContentsInnerHTML: `<div class="col-lg-12 modal-highlight"> 🙀🤖😿<br>We Are Sad to See You Go</div>
			<div class="col-lg-12 modal-description">
				<p>But, it's not too late to change your mind. You can use your coding spaces and won't be charged until {{planRenewalDate}}.</p>
            </div>
            <div class="checkbox">
		        <ul class="checkbox_common">
		            <li>
		                <input type="checkbox" id="cancelCheckbox">
		                <label for="cancelCheckbox">I understand that by cancelling my plan I will not be 
		                able to access my coding spaces including all the files and data at the end of my billing cycle.</label>
		            </li>
		        </ul>
		    </div>
            `
	, modalCancelBtnText: 'Keep My Plan'
	, modalSubmitBtnText: 'Proceed to Cancel'
	, modalCancelBtnAction: function() {
		$cancelPlanModalStepOne.destroy();
	}
	, modalSubmitBtnAction: function() {
		sendCancellationRequest();
		$cancelPlanModalStepTwo.show();
	}
})

const $cancelPlanModalStepTwo = new Modal({
	modalContainerId: 'cancelPlanModal'
	, modalTitleText: `Cancellation Request Received`
	, modalContentsInnerHTML: `<div class="col-lg-12 modal-description cancellation-request-container">
				<p>Your cancellation request has been received. We will handle your request immediately and notify you 
				when the cancellation is completed.</p>
                
            </div>
            `
	, modalCancelBtnText: 'OK'
	, modalCancelBtnAction: function() {
		$cancelPlanModalStepTwo.destroy();
		location.reload();
	}
})

const $addNewModal = new Modal({
	modalContainerId: 'addNewModal'
	, modalTitleText: `Add New`
	, modalContentsInnerHTML: `
		<div class="col-lg-6">
            <div class="form-input">
                <label>First Name*</label>
                <div class="input-items default empty">
                    <input type="text" placeholder="" class='firstName' required>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="form-input">
                <label>Last Name</label>
                <div class="input-items-optional default">
                    <input type="text" placeholder="" class='lastName'>
                </div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="form-input">
                <label>Email</label>
                <div class="input-items-optional default">
                    <input type="email" placeholder="" class='subdomainEmail'>
                </div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="form-input url">
                <label>URL Address*</label>
                <div class="input-items url default empty">
                    <input type="url" placeholder="" class='subdomainURL' required>
                    <span class="domain-name">.{{entity.domain}}</span>
                </div>
            </div>
        </div>
            `
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Update'
	, modalCancelBtnAction: function() {
		$addNewModal.destroy();
	}
	, modalSubmitBtnAction: addNewCodingSpaces
})

const $editModal = new Modal({
	modalContainerId: 'editModal'
	, modalTitleText: `Edit`
	, modalContentsInnerHTML: `
		<div class="col-lg-6">
            <div class="form-input">
                <label>First Name</label>
                <div class="input-items default empty">
                    <input type="text" placeholder="" id='firstName'>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="form-input">
                <label>Last Name</label>
                <div class="input-items default empty">
                    <input type="text" placeholder="" id='lastName'>
                </div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="form-input">
                <label>Email</label>
                <div class="input-items-optional default empty">
                    <input type="email" placeholder="" id='email'>
                </div>
            </div>
        </div>
        <div class="col-lg-12">
            <div class="form-input url">
                <label><span>URL Address</span><span class="description">URL change takes an hour to start working.</span></label>
                <div class="input-items url default empty">
                    <input type="url" placeholder=""  id='subdomain'>
                    <span class="domain-name" id="domainName">.{{entity.domain}}</span>
                </div>
            </div>
        </div>
    `
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Update'
	, modalCancelBtnAction: function() {
		$editModal.destroy();
	}
	, modalSubmitBtnAction: editCodingSpaces
})

const $deleteModal = new Modal({
	modalContainerId: 'deleteModal'
	, modalTitleText: `Delete Coding Spaces`
	, modalContentsInnerHTML: `
		<div class="modal-description">
			<p>Are you sure you want to delete <span class="subdomain-name code"></span>?</p>
			<p>Deleting this coding space will permanently delete all associated files and data. You cannot undo this operation.</p>
		</div>
        <div class="col-lg-12">
        	<p>To confirm, please enter the full URL of the coding space.</p>
            <div class="form-input">
                <div class="input-items default empty">
                    <input id="urlToDelete" type="text" placeholder="">
                </div>
            </div> 
        </div>
        <input type='hidden' id='subdomainToDelete' value=''> 
        `
	, modalCancelBtnText: 'Cancel'
	, modalCancelBtnAction: function() {
		$deleteModal.destroy();
	}
	, modalSubmitBtnText: 'Delete Coding Space'
	, modalSubmitBtnAction: deleteCodingSpace
})

function togglePaymentCycle() {
	if (togglePaymentCycleBtn.checked) {
		document.querySelector('.domain-renew-info').style.display = 'inline-block';
		document.querySelectorAll('.domain-renew-cancel').forEach(d => d.style.display = 'none');
	} else {
		document.querySelector('.domain-renew-info').style.display = 'none';
		document.querySelectorAll('.domain-renew-cancel').forEach(d => d.style.display = 'inline-block');
	}
	restfull.patch({path: '/domain/autorenew', data: {
		domain: '{{domain}}', autorenew: togglePaymentCycleBtn.checked
	}},(err, resp) => {});
}

function updatePaymentMethod() {
	stripe.createToken(card).then(function(result) {
		if (result.error) {
			// Inform the customer that there was an error.
			var errorElement = document.getElementById('card-errors');
			errorElement.textContent = result.error.message;
		} else {
			restfull.patch({path: '/account/payment/update', data: {token: result.token}}, (err, resp) => {
				resp = JSON.parse(resp);
				if(resp.error) return alert(resp.error.message);
				location.reload();
			})
		}
	});
}

function keepMyPlan() {
	if(keepClicked) return;
	if(!latestSubscriptionPlanId) return;
	keepClicked = true;
	restfull.patch({
		path: `/subscribe/${latestSubscriptionPlanId}/keep`
	}, (err, resp) => {
		location.reload();
	})
}

function sendCancellationRequest() {
	if(cancellationComplete) return;
	$cancelPlanModalStepTwo.show();
	cancellationComplete = 'pending';
	restfull.post({
		path: `/subscribe/${latestSubscriptionPlanId}/cancel`
	}, (err, resp) => {
		cancellationComplete = true;
	})
}

function runValidator() {
	this.parentNode.classList.remove('empty');
	var vd = this.getAttribute('validator');
	if (!vd) return;
	var vfn = validators[vd];
	if(!vfn(this.value)) {
		this.parentNode.classList.remove('default');
		this.parentNode.classList.add('error');
	} else {
		this.parentNode.classList.remove('error');
		this.parentNode.classList.add('default');
	}
} 

function openOverflowActions(target) {
	if(!target.parentNode.previousElementSibling.classList.contains('preparing')){
		target.nextElementSibling.addEventListener('click', function(){
			closeOverflowActions();
		});
		target.nextElementSibling.style.display = 'block';
		target.nextElementSibling.classList.add('opened');
		target.nextElementSibling.nextElementSibling.style.display = 'block';
		target.nextElementSibling.nextElementSibling.classList.add('opened');
	}
}

function closeOverflowActions() {
	let actionsBackground = document.querySelector('.actions-background.opened')
		, actionsList = document.querySelector('.actions-list.opened')
		;
	if (actionsBackground && actionsList) {
		actionsBackground.classList.remove('opened');
		actionsBackground.style.display = 'none';
		actionsList.classList.remove('opened');
		actionsList.style.display = 'none';
	}
}

function openEditModal(first, last, email, subdomain) {
	closeOverflowActions();
	$editModal.show();
	document.getElementById('firstName').value = first;
	document.getElementById('lastName').value = last;
	document.getElementById('email').value = email;
	document.getElementById('subdomain').value = subdomain.split('.')[0];
	document.querySelector('#editModal #submitBtn').setAttribute('data-id', subdomain);
}

function openDeleteModal(subdomain) {
	closeOverflowActions();
	$deleteModal.show();
	const $deleteBtn = document.querySelector('#deleteModal #submitBtn')
		, $subdomainName = document.querySelector('.subdomain-name')
		, $urlToDelete = document.getElementById('urlToDelete')
		;
	function validateInput (subdomain) {
		if (document.getElementById('urlToDelete').value.trim() === $subdomainName.innerText) $deleteBtn.disabled = false;
		else $deleteBtn.disabled = true;
	}
	document.querySelector('#deleteModal #subdomainToDelete').value = subdomain;
	$urlToDelete.value = '';
	$deleteBtn.setAttribute('data-id', subdomain);
	$subdomainName.innerText = subdomain;
	$urlToDelete.addEventListener('keyup', validateInput);
}

function addNewCodingSpaces() {
	var firstName = document.querySelector('#addNewModal .firstName').value.trim()
		, lastName = document.querySelector('#addNewModal .lastName').value.trim()
		, email = document.querySelector('#addNewModal .subdomainEmail').value.trim()
		, subdomain = document.querySelector('#addNewModal .subdomainURL').value.toLowerCase().replace(/\W/g, '')
		, subdomainURL = `${subdomain}.${entityDomain}`
		, newEntries = {}
		;
	if(newEntries[subdomainURL] || !firstName || !subdomain) {
		return;
	}
	if(codingspaces.find(codingspace => codingspace.subdomain === subdomainURL)) {
		if(!addNewModal.querySelector('.alertMessage')) {
			let alertMessage = document.createElement('p');
			alertMessage.className = 'alertMessage';
			alertMessage.innerText = 'This URL already exists.';
			document.querySelector('#addNewModal .url').appendChild(alertMessage);
		}
		return;
	}
	
	newEntries[subdomainURL] = { firstName, lastName, email };
	clearTimeout(updateto);

	restfull.post({
		path: `/entity/${entity}/addmembers`
		, data: {members: newEntries}
	}, (err, resp) => {
		if(err) return alert(err);
		var newmember = JSON.parse(resp).newmembers.reverse()[0];
		codingspaces.push(newmember);
		bindCodingSpaceRows();
		$addNewModal.destroy();
		update();
	});
}

function editCodingSpaces() {
	const payload = {
		first: document.getElementById('firstName').value 
	  , last: document.getElementById('lastName').value
	  , email: document.getElementById('email').value
	  , subdomainHead: document.getElementById('subdomain').value
	  , domainName: entityDomain
	  , subentity: document.querySelector('#editModal #submitBtn').getAttribute('data-id')
	}
	payload.subdomain = `${payload.subdomainHead}.${payload.domainName}`
	clearTimeout(updateto);
	restfull.patch({path: `/entity/${entity}/proddyno`, data: payload},(err, resp) => {
		$editModal.destroy();
		update();
	})
}

function takeItOffline(subdomain) {
	const payload = {
		  subentity: subdomain
		, offline: true
	}
	clearTimeout(updateto);
	restfull.patch({path: `/entity/${entity}/proddyno`, data: payload},(err, resp) => {
		update();
	})
} 

function takeItOnline(subdomain) {

	const payload = {
		  subentity: subdomain
		, offline: false
	}
	clearTimeout(updateto);
	restfull.patch({path: `/entity/${entity}/proddyno`, data: payload},(err, resp) => {
		update();
	})
} 

function deleteCodingSpace() {
	const payload = {
		  subentity: $subdomainToDelete.value
	}
	if(codingspaces.length <= 1) return;

	clearTimeout(updateto);
	restfull.del({path: `/entity/${entity}/proddyno`, data: payload},(err, resp) => {
		closeDeleteModal() 
		update();
	})
}

function flattenObject(obj, flatObj, prefix) {
	flatObj = flatObj || {};
	prefix = prefix || '';
	if(obj === null || Array.isArray(obj) || ['undefined', 'string', 'number', 'boolean'].includes(typeof(obj))) {
		flatObj[prefix] = obj;
		return flatObj;
	}
	try {
		obj = JSON.parse(JSON.stringify(obj));
		return Object.keys(obj).reduce((o, k) => {
			let val = obj[k];
			let flatKey = prefix ? `${prefix}.${k}` : k;
			if(val && typeof(val) === 'object') {
				return flattenObject(val, o, flatKey);
			} else {
				o[flatKey] = val;
				return o;
			}
		}, flatObj)
	} catch(ex) {
		flatObj[prefix] = obj;
		return flatObj;
	}
}

function bindDataToTemplate(template, data) {
	let boundTemplate = '';
	try {
		let flattenData = flattenObject(data);
		boundTemplate =  Object.keys(flattenData).reduce((text,k) => {
			let val = flattenData[k] + '';
			text = text.replace(new RegExp(`{{${k}}}`, 'gi'), val);
			return text;
		}, template + '');

		return boundTemplate;
	} catch(ex) {
		return boundTemplate;
	}
}

function bindCodingSpaceRows() {
	$codingspacebody.innerHTML = '';
	(codingspaces || []).forEach(c => {
		let status = '', statusAnimation = '', action1 = '', action2 = '', action3 = '';
		if(![true, false].includes(c.provisioned)) {
			status = 'Preparing';
			statusAnimation = `<div id="blink"><span>.</span><span>.</span><span>.</span></div>`;
			action1 = '';
			action2 = '';
			action3 = '';
		} else if(domainCanceled) {
			status = 'Unable to Connect';
			statusAnimation = '';
			action1 = 'Contact Support';
			action2 = '';
			action3 = '';
		} else if (domainExpired) {
			status = 'Unable to Connect';
			statusAnimation = '';
			action1 = 'Backup';
			action2 = 'Contact Support';
			action3 = '';
		} else if(c.offline === true) {
			status = 'Offline';
			statusAnimation = '';
			action1 = 'Take It Online';
			action2 = codingspaces.length > 1 ? 'Delete' : '';
			action3 = '';			
		} else if(c.provisioned === true) {
			status = 'Online';
			statusAnimation = '';
			action1 = 'Go To Admin';
			action2 = 'Edit';
			action3 = 'Take It Offline';			
		} else if(c.provisioned === false) {
			status = 'Preparing';
			statusAnimation = `<div id="blink"><span>.</span><span>.</span><span>.</span></div>`;
			action1 = '';
			action2 = '';
			action3 = '';
		} 
		
		const tr = document.createElement('tr')
			, bindingData = {
				first: c.first
				, last: c.last
				, subdomainEmail: c.email ? c.email : subscriberEmail
				, subdomain: c.subdomain
				, status: status
				, statusAnimation: statusAnimation
				, action1: action1
				, action2: action2
				, action3: action3
			}
		;
		
		bindingData.statusclass = bindingData.status.toLowerCase().replace(/\s/g, '');
		bindingData.actionclass1 = bindingData.action1.toLowerCase().replace(/\s/g, '');
		bindingData.actionclass2 = bindingData.action2.toLowerCase().replace(/\s/g, '');
		bindingData.actionclass3 = bindingData.action3.toLowerCase().replace(/\s/g, '');
		tr.innerHTML = bindDataToTemplate(codingspacerowTemplate, bindingData);

		var elem = tr.querySelector('.actions.takeitoffline');
		if(elem) elem.addEventListener('click', (e) => {
			e.target.style.display = 'none';
			takeItOffline(c.subdomain)
		});
		elem = tr.querySelector('.actions.delete');
		if(elem) elem.addEventListener('click', () => {
			openDeleteModal(c.subdomain);
		});
		elem = tr.querySelector('.actions.edit');
		if(elem) elem.addEventListener('click', () => {
			openEditModal(c.first, c.last, c.email, c.subdomain)
		});
		elem = tr.querySelector('.actions.takeitonline');
		if(elem) elem.addEventListener('click', () => {
			takeItOnline(c.subdomain);
		});
		elem = tr.querySelector('.actions.gotoadmin');
		if(elem) elem.addEventListener('click', () => {
			$adminLink.href = `https://${c.subdomain}/admin`;
			$adminLink.click();
		});
		elem = tr.querySelector('.actions.contactsupport');
		if(elem) elem.style.color = 'var(--color-blue)';
		if(elem) elem.style.cursor = 'pointer';
		if(elem) elem.addEventListener('click', () => {
			location.href = '/contactus';
		})
		elem = tr.querySelector('.actions.backup');
		if(elem) elem.style.color = 'var(--color-blue)';
		if(elem) elem.style.cursor = 'pointer';
		if(elem) elem.addEventListener('click', () => {
			location.href=`/migrate/{{entityId}}/download?domain=${c.subdomain}`
		})
		elem = tr.querySelector('.status.unabletoconnect');
		if(elem) elem.style.color = 'var(--color-red)';
		
		$codingspacebody.append(tr);
	})
	if((codingspaces || []).length >= plansize) {  
		addNew.setAttribute('disabled', '');
	} else {
		addNew.removeAttribute('disabled');
	}
	document.querySelectorAll('.actions-container .ic-overflow').forEach(i => {
		i.addEventListener('click', (e) => {
			openOverflowActions(e.target);
		})
	})
}

function update() {
	clearTimeout(updateto);
	restfull.get({path: `/entity/${entity}/proddynos`},(err, resp) => {
		if(err) return location.reload();
		try {
			if(previousCodingSpaces === resp) return;
			previousCodingSpaces = resp;
			codingspaces = JSON.parse(resp);
			bindCodingSpaceRows();
			clearTimeout(updateto);
			updateto = setTimeout(update, 5000);
		} catch(ex) {
			location.reload()
		}
	})
}

if(togglePaymentCycleBtn) { 
	togglePaymentCycleBtn.addEventListener('change', togglePaymentCycle);
	if({{autorenewdomain}}) togglePaymentCycleBtn.checked = true;
}
$openUpdatePaymentModal.addEventListener('click', () => {
	$updatePaymentModal.show();
	card.mount('#card-element');
	
	const displayError = document.getElementById('card-errors');
	
	card.addEventListener('change', ({error}) => {
		if (error) {
			displayError.textContent = error.message;
		} else {
			displayError.textContent = '';
		}
	});
});
$openCancelPlanModal.addEventListener('click', () => {
	$cancelPlanModalStepOne.show();
	var cancelCheckbox = document.querySelector('#cancelCheckbox')
		, cancelSubmitButton =  document.querySelector('#cancelPlanModal #submitBtn');
	cancelSubmitButton.setAttribute('disabled', 'disabled');
	cancelCheckbox.addEventListener('change', (e) => {
		if(e.target.checked) {
			cancelSubmitButton.addEventListener('click', sendCancellationRequest);
			cancelSubmitButton.removeAttribute('disabled');
		} else {
			cancelSubmitButton.removeEventListener('click', sendCancellationRequest);
			cancelSubmitButton.setAttribute('disabled', 'disabled');
		}
	});
})
addNew.addEventListener('click', () => {
	$addNewModal.show();
})
bindCodingSpaceRows();
previousCodingSpaces = JSON.stringify(codingspaces);
if($keepMyPlanBtn) $keepMyPlanBtn.addEventListener('click', keepMyPlan);