const env = CONFIG;
let host = '';
if (env === 'dev') {
    host = 'http://localhost:8085/#/'
} else {
    host = './ng2/#/'
}

export default {
    goNG2Page(url) {
        const NGPage1 = document.querySelector('#NG1Page');
        const NGPage2 = document.querySelector('#NG2Page');
        const NG1Footer = document.querySelector('#NG1Foooter');
        NGPage1.style.display = 'none';
        NGPage2.style.display = 'block';
        NG1Footer.style.display = 'none';
		document.body.style.overflow = 'hidden';
		const cityId = localStorage.getItem('cityId');
		NGPage2.querySelector('iframe').src = host + url + '#' + cityId;
    },
    hideNG2Page() {
        const NGPage1 = document.querySelector('#NG1Page');
        const NGPage2 = document.querySelector('#NG2Page');
        const NG1Footer = document.querySelector('#NG1Foooter');
        if (NGPage1) {
            NGPage1.style.display = 'block';
            NG1Footer.style.display = 'flex';
            document.body.style.overflow = 'auto';
        }
        NGPage2 && (NGPage2.style.display = 'none');
    },
    preloadNG2Page() {
        const iframe = document.createElement('iframe');
        iframe.src = host;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.onload = () => {
            document.body.removeChild(iframe);
        };
    },
    slideUpNG2Page(show){
		const NGPage2 = document.querySelector('#NG2Page');
		if(NGPage2.style.display === 'block'){
			if(show){
				NGPage2.classList.remove('top_0');
				NGPage2.classList.add('top_65');
			}else{
				NGPage2.classList.remove('top_65');
				NGPage2.classList.add('top_0');
			}
		}
	}

};