import Modal from '/libs/modal/script.js';

var subscriberId = '{{subscriberId}}'
	, $changeNameBtn = document.querySelector('.change-name')
	, $changeEmailBtn = document.querySelector('.change-email')
	, $updatePasswordBtn = document.getElementById('updatePwBtn')
	, $currentPassword = document.querySelector('#currentPassword')
	, $password = document.querySelector('#password')
	, $toggleCurrentPassword = document.querySelector('#toggleCurrentPassword')
	, $togglePassword = document.querySelector('#togglePassword')
	;

const $updateNameModal = new Modal({
	modalContainerId : 'updateNameModal'
	, modalTitleText: 'Update Name'
	, modalContentsInnerHTML:`
		<div class="col-lg-12">
			<div class="form-input">
	            <label>First Name</label>
	            <div class="input-items default empty">
	                <input type="text" value="{{firstName}}" id='first'>
	            </div>
	        </div> <!-- form input -->
	    </div>
	    <div class="col-lg-12">
	        <div class="form-input">
	            <label>Last Name</label>
	            <div class="input-items default empty">
	                <input type="text" value="{{lastName}}" id='last'>
	            </div>
	        </div> <!-- form input -->
	    </div>
	`
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Update'
	, modalCancelBtnAction: function(){
		$updateNameModal.destroy();
	}
	, modalSubmitBtnAction: function(){
		updateAccountSettings(["first", "last"]);
	}
});

const $updateEmailVerifyModal = new Modal({
	modalContainerId : 'updateEmailModalVerify'
	, modalTitleText: 'Verify Your Password'
	, modalContentsInnerHTML:`
		<span class="modal-description">Enter your password to continue</span>
		<div class="col-lg-12 ">
            <div class="form-input">
                <label>Password</label>
                <div class="input-items default empty">
                    <input id='emailpwdcheck' type="password" placeholder="" required>
                    <i class='ic-eye gray-200' id='toggleEmailPassword'></i>
                </div>
            </div>
        </div>
	`
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Continue'
	, modalCancelBtnAction: function(){
		$updateEmailVerifyModal.destroy();
	}
	, modalSubmitBtnAction: function(){
		verifyCurrentPassword('emailpwdcheck');
	}
});

const $updateEmailChangeModal = new Modal({
	modalContainerId : 'updateEmailModalChange'
	, modalTitleText: 'Update Email'
	, modalContentsInnerHTML:`
		<span class="modal-description">Enter your new email address</span>
		<div class="col-lg-12">
            <div class="form-input">
                <label>Email</label>
                <div class="input-items default empty">
                    <input value="{{email}}" id='email' type="email" required>
                </div>
            </div>
        </div>
	`
	, modalCancelBtnText: 'Cancel'
	, modalSubmitBtnText: 'Update'
	, modalCancelBtnAction: function(){
		$updateEmailChangeModal.destroy();
	}
	, modalSubmitBtnAction: function(){
		const $email = document.querySelector('#email');
		if(!$email.value || !$email.value.includes('@') || !$email.value.includes('.')) {
			$email.value = '';
			$email.placeholder = 'Please enter a valid email';
			$email.parentElement.classList.replace('default', 'error');
			return
		}
		updateAccountSettings(["email"]);
	}
});

function openChangePasswordModal() {
	changePasswordModal.style.display = 'block';
	changePasswordModalStepTwo.style.display = 'none';
	changePasswordModalStepOne.style.display = 'block';
	document.getElementById('changepwdcheck').placeholder = '';
	document.getElementById('changepwdcheck').parentElement.className = 'input-items default empty';
}

function closeChangePasswordModal() {
	changePasswordModal.style.display = 'none';
	changePasswordModalStepOne.style.display = 'none';
	changePasswordModalStepTwo.style.display = 'none';
}

function verifyCurrentPassword(id) {
	const pinput = document.getElementById(id);
	if(!pinput || !pinput.value) {
		pinput.placeholder = 'Please enter a password';
		pinput.parentElement.classList.replace('default', 'error');
	}
	const pwd = pinput.value;
	restfull.post({path: '/account/checkpassword', data: {password: pwd } }, (err, resp) => {
		pinput.value = '';
		if(err) {
			pinput.placeholder = 'Please enter a password';
			pinput.parentElement.classList.replace('default', 'error');
			return;
		}
		try {
			resp = JSON.parse(resp);
		} catch(ex) {
			return alert('There was an error;')
		}
		if(!resp || !resp.matched) {
			pinput.placeholder = 'Passwords did not match';
			pinput.parentElement.classList.replace('default', 'error');
			return;
		}
		if(id === 'emailpwdcheck') {
			$updateEmailVerifyModal.destroy();
			$updateEmailChangeModal.show();
		}
		if(id === 'currentPassword') {
			updateAccountSettings(["password"]);
		}
	});
}

function updateAccountSettings(fields) {
	const payload = fields.reduce((o, id) => {
		const $f = document.querySelector(`input#${id}`);
		if(!$f) return o;
		
		const val = $f.value;
		if(!val || !val.length) {
			return o;
		}
		
		o[id] = val;
		return o;
	}, {})
	if(!Object.keys(payload).length) return alert('Please enter valid info');

	restfull.patch({path: `/subscribe/${subscriberId}`, data: payload}, (err, resp, status) => {
		if(status === 409) return alert('Email already taken');
		if(payload.email || payload.first || payload.last) return location.reload();
		showSuccessMessage('#updatePwBtn');
	});
}

function showSuccessMessage(id) {
	var $updatedText = document.createElement('span');
	$updatedText.className = 'updated-text';
	$updatedText.innerText = 'Updated successfully!';
	document.querySelector(id).parentElement.appendChild($updatedText);
	setTimeout(function(){
		document.querySelector(id).parentElement.removeChild($updatedText);
		location.reload();
	}, 3000);
}

function togglePasswordVisibility(toggleElement, passwordElement) {
	toggleElement.addEventListener('click', function () {
		const $type = (passwordElement.type === 'password') ? 'text' : 'password';
		passwordElement.type = $type;
		this.classList.toggle('ic-eye-slash');
	});
}

togglePasswordVisibility($toggleCurrentPassword, $currentPassword);
togglePasswordVisibility($togglePassword, $password);
$changeNameBtn.addEventListener('click', function() {
	$updateNameModal.show();
});
$changeEmailBtn.addEventListener('click', function(){
	$updateEmailVerifyModal.show();
	let $emailpwdcheck = document.querySelector('#emailpwdcheck')
		, $toggleEmailPassword = document.querySelector('#toggleEmailPassword')
	;
	togglePasswordVisibility($toggleEmailPassword, $emailpwdcheck);
});
$updatePasswordBtn.addEventListener('click', function(){
	var $newPassword = document.getElementById('password');
	if(!$newPassword.value) {
		$newPassword.placeholder = 'Please enter a password';
		$newPassword.parentElement.classList.replace('default', 'error');
		return;
	}
	verifyCurrentPassword('currentPassword');
});