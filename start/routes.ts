import Route from '@ioc:Adonis/Core/Route'

Route.post('/session', 'SessionsController.store')
Route.get('/games', 'GamesController.index')
Route.get('/games/:id', 'GamesController.show')

Route.group(() => {
  Route.post('/', 'ForgotPasswordsController.store')
  Route.patch('/recovery', 'ForgotPasswordsController.update')
}).prefix('/forgot-password')

Route.group(() => {
  Route.post('/', 'UsersController.store')
  Route.group(() => {
    Route.get('/', 'UsersController.index')
    Route.put('/', 'UsersController.update')
    Route.delete('/', 'UsersController.destroy')
  }).middleware('auth')

  Route.group(() => {
    Route.post('/', 'BetsController.store')
    Route.get('/', 'BetsController.index')
    Route.get('/:betId', 'BetsController.show')
    Route.delete('/:betId', 'BetsController.destroy')
    Route.patch('/:betId', 'BetsController.update')
  })
    .prefix('/bets')
    .middleware('auth')
}).prefix('/users')

Route.group(() => {
  Route.group(() => {
    Route.patch('/promote-user/:userId', 'AdminsController.promoteUser')
    Route.patch('/demote-user/:userId', 'AdminsController.demoteUser')
    Route.delete('/delete-user/:userId', 'AdminsController.deleteUser')
    Route.get('/', 'AdminsController.getAllUsers')
  }).prefix('/users')

  Route.group(() => {
    Route.post('/', 'GamesController.store')
    Route.put('/:id', 'GamesController.update')
    Route.delete('/:id', 'GamesController.destroy')
  }).prefix('/games')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('authAdmin')
