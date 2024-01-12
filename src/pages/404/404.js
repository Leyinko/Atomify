import './404.css';

export const Error404 = () => {
  return `
		<div id="error404">
			<h1>501 || 404</h1>
			<span>Not Implemented || Page Not Found</span>
			<p>Attempted to quantum leap to this feature, got stuck in a time loop</p>
			<h3>Tried to unlock time-defying features, but reality said 'not yet'</h3>
			<button>Back to Home</button>
		</div>
	`;
};

// > Back Home Handler

export const errorBtnHandler = () => {
  let btn = document.querySelector('#error404 button');
  btn.addEventListener('click', () => {
    let anchor = document.querySelector('#home_anchor');
    anchor.click();
  });
};
