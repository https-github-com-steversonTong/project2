const router = require('express').Router()
const games = require('../jsonDB/games.json')
const game = games.filter(g => g.title === 'LIAR LIAR')[0]
const { Portal, User, Round, Question, Answer } = require('../models')
const checkPhase = require('../utils/checkPhase');
const { Op } = require("sequelize");

/**
* Prompt user to create new portal or join current portal with code
* @param  {}
* @return {game}
*/
router.get('/', async (req, res) => {
  try {
    res.render('liarliar/game', {
      game
    })

  } catch (err) {

    res.status(500).json(err)

  }
})

/**
* Waiting, Question or Answer phase
* Check to make sure the portals current phase is the
* same as the req.params.phase
* @param  {code, phase}
* @return {game, portal, portalLeader, currentUser, loggedIn, round, answers}
*/
router.get('/:code/:phase', checkPhase, async (req, res) => {
  try {
    const portalData = await Portal.findOne({
      include: [
        { model: Round },
        { model: User }
      ],
      attributes: ['id', 'code', 'round', 'phase'],
      where: {
        code: req.params.code,
        game: game.title
      }
    })

    const portal = portalData.get({ plain: true })

    let round

    if (portal.rounds.length > 0) {
      const roundData = await Round.findOne({
        include: [
          { model: Question },
          { model: Portal }
        ],
        attributes: ['id', 'round'],
        where: {
          id: portal.rounds.filter(r => r.round === portal.round)[0].id,
          portal_id: portal.id
        }
      })

      round = roundData.get({ plain: true })
    }

    const portalLeaderData = await User.findOne({
      attributes: ['id', 'name', 'leader', 'avatar', 'points'],
      where: {
        leader: 1,
        portal_id: portal.id
      }
    })

    const currentUserData = await User.findOne({
      attributes: ['id', 'name', 'leader', 'avatar', 'points'],
      where: {
        id: req.session.user,
        portal_id: portal.id
      }
    })

    const currentUser = currentUserData.get({ plain: true })

    const userData = await User.findAll({
      include: [
        { model: Portal }
      ],
      attributes: ['id', 'name', 'leader', 'points', 'avatar'],
      where: {
        id: { [Op.not]: currentUser.id },
        portal_id: portal.id
      }
    })

    const users = userData.map(u => u.get({ plain: true }))

    const portalLeader = portalLeaderData.dataValues.id === req.session.user ? true : false

    let answers

    if (req.params.phase === 'answer') {
      const answerData = await Answer.findAll({
        include: [
          { model: Round },
          { model: User }
        ],
        attributes: ['id', 'answer'],
        where: {
          round_id: round.id
        },
        order: [
          ['answer', 'DESC']
        ]
      })

      answers = answerData.map(a => a.get({ plain: true }))
    }

    res.render(`liarliar/${req.params.phase}`, {
      portal,
      game,
      round,
      portalLeader,
      currentUser,
      users,
      answers,
      loggedIn: req.session.portal === portal.id ? true : false
    })
  } catch (err) {

    res.status(500).json(err)

  }
})

module.exports = router
