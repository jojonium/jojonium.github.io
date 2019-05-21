/* (c) 2019 Joseph Petitti | https://josephpetitti.com/license.txt */
window.addEventListener('scroll', (e) => {
	let pageTop = window.scrollY;
	let pageBottom = pageTop + window.innerHeight;
	
	let tags = document.getElementsByClassName('fadein');
	for (let tag of tags) {
		if (tag.offsetTop < pageBottom) {
			tag.classList.add('visible');
		} else {
			tag.classList.remove('visible');
		}
	}
});
