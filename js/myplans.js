import Modal from '/libs/modal/script.js';
let $starterPassBtn = document.getElementById('starterPassBtn');
let products = {{products}}

const $starterPassModal = new Modal({
	modalContainerId: 'starterPassModal'
	, modalTitleText: `Choose a Starter Pass`
	, modalContentsInnerHTML: `
	<div class="modal-description">
		<table>
			<tr class="pass365">
				<td class="pass-name">${products && products.starter365d  && products.starter365d.period } days access</td>
				<td class="pass-price"><span class="dollar"></span>${products && products.starter365d  && products.starter365d.cost }<span class="extra-note">save 38%</span></td>
				<td class="select-btn-container">
					<a  href="/subscribe/checkout/starter365d"><button id="" class="qoom-main-btn qoom-button-full qoom-button-small">select</button></a>
				</td>
			</tr>
			<tr class="pass90">
				<td class="pass-name">${products && products.starter90d  && products.starter90d.period } days access</td>
				<td class="pass-price"><span class="dollar"></span>${products && products.starter90d && products.starter90d.cost }<span class="extra-note">save 17%</span></td>
				<td class="select-btn-container">
					<a  href="/subscribe/checkout/starter90d"><button id="" class="qoom-main-btn qoom-button-outline qoom-button-small">select</button></a>
				</td>
			</tr>
			<tr class="pass30">
				<td class="pass-name">${products && products.starter30d  && products.starter30d.period } days access</td>
				<td class="pass-price"><span class="dollar"></span>${products && products.starter30d  && products.starter30d.cost }</td>
				<td class="select-btn-container">
					<a  href="/subscribe/checkout/starter30d"><button id="" class="qoom-main-btn qoom-button-outline qoom-button-small">select</button></a>
				</td>
			</tr>
		</table>
	</div>
	`
});

if ($starterPassBtn) {
	$starterPassBtn.addEventListener('click', function(){
	$starterPassModal.show();
	});
};

try {
	Array.from(document.querySelectorAll('.updatetz')).forEach(e => {
		const date = new Date(e.innerText.trim());
		if((date + '') === "Invalid Date") return;
		e.innerText = date.toLocaleDateString();
	})
} catch(ex) {}