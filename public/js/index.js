const bb = require('./api/index')

/*
* Parse DOM for twemojis
* use npm twemoji to convert from emoji to twemoij
*/
twemoji.parse(document.body);

/*
* Parse DOM for twemojis
* use npm twemoji to convert from emoji to twemoij
*/
function formatQuestion (question) {
  question = question.substring('<BLANK>', '________')

  return question
}

/*
* Hover effect on "BABELBOX"
*/
window.big = function (event) {
  let letter = event.srcElement
  letter.classList.add('scale-150')
  if (letter.previousSibling.nodeType != Node.TEXT_NODE) {
    let previousLetter = letter.previousSibling
    previousLetter.classList.add('scale-125')
    if (previousLetter.previousSibling.nodeType != Node.TEXT_NODE) {
      previousLetter.previousSibling.classList.add('scale-100')
    }
  }
  if (letter.nextSibling.nodeType != Node.TEXT_NODE) {
    let nextLetter = letter.nextSibling
    nextLetter.classList.add('scale-125')
    if (nextLetter.nextSibling.nodeType != Node.TEXT_NODE) {
      nextLetter.nextSibling.classList.add('scale-100')
    }
  }
}
window.small = function (event) {
  let letter = event.srcElement
  letter.classList.remove('scale-150')
  if (letter.previousSibling.nodeType != Node.TEXT_NODE) {
    let previousLetter = letter.previousSibling
    previousLetter.classList.remove('scale-125')
    if (previousLetter.previousSibling.nodeType != Node.TEXT_NODE) {
      previousLetter.previousSibling.classList.remove('scale-100')
    }
  }
  if (letter.nextSibling.nodeType != Node.TEXT_NODE) {
    let nextLetter = letter.nextSibling
    nextLetter.classList.remove('scale-125')
    if (nextLetter.nextSibling.nodeType != Node.TEXT_NODE) {
      nextLetter.nextSibling.classList.remove('scale-100')
    }
  }
}

/*
* Join the portal with the given portal name
*/
window.joinPortal = function (game) {
  let portal = document.querySelector('#portal-name').value;

  window.location.href = `/${game}/${portal}`;
}

/*
* Create a new portal, and then create a new user, and enter that portal
*/
window.createPortal = async function (game) {
  let name = document.querySelector('#user-name').value;

  let portal = await bb.create('portal', { game })
  console.log(portal)
  let user = await bb.create('user', {name, portal_id: portal.id})

  window.location.href = `/${game}/${portal.code}`
}

/*
* Create a new user inside the given portal
*/
window.createUser = async function (portal_id) {
  let name = document.querySelector('#user-name').value;

  let user = await bb.create('user', {name, portal_id})
}

/*
* Start a new game by creating a new Round
*/
window.startGame = async function (game, portal_id, roundNum) {
  let portal = await bb.read('portal', {id: portal_id})

  let round = await bb.create('round', {portal_id, roundNum})

  window.location.href = `/${game}/${portal.code}/question`
}

/*
* Submit an answer for a certain round
*/
window.submitAnswer = async function (user_id, round_id) {
  let submission = document.querySelector('#user-answer').value;

  let answer = await bb.create('answer', {round_id, user_id, answer: submission})
}

/*
* Select an answer for a certain round
*/
window.selectRightAnswer = async function (user_id, round_id) {
  let user = await bb.read('user', {id: user_id})

  let round = await bb.read('round', {id: round_id})

  await bb.update('user', {id: user_id, points: (user.points + 100)})

  nextRound(user, round)
}

/*
* Select an answer for a certain round
*/
window.selectLie = async function (currentUserId, user_id, round_id) {
  let user = await bb.read('user', {id: user_id})

  let currentUser = await bb.read('user', {id: currentUserId})

  let round = await bb.read('round', {id: round_id})

  await bb.update('user', {id: user_id, points: (user.points + 50)})

  nextRound(currentUser, round)
}

/*
* Move the portal to the next round
*/
async function nextRound (currentUser, round) {
  if (currentUser.leader) {
    await bb.create('round', {portal_id: round.portal.id, round: (round.round + 1)})

    await bb.update('portal', {id: round.portal.id, round: (round.round + 1)})
  }
}
