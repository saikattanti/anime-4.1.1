import {
  animate,
  utils,
} from '../../../lib/anime.esm.js';

const buttons = /** @type {Array<HTMLButtonElement>} */(utils.$('.button'));

const colors = ['#0FF', '#F0F', '#FF0'];

const timekeepAnimate = utils.keepTime(duration => animate('.square', {
  y: 200,
  scale: utils.random(.8, .9, 2),
  background: utils.randomPick(colors),
  alternate: true,
  loop: true,
  duration
}));

buttons.forEach($button => {
  $button.addEventListener('click', () => {
    timekeepAnimate($button.innerText);
  });
});
