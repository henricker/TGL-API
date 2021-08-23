import Route from '@ioc:Adonis/Core/Route'

Route.post('/session', 'SessionsController.store')
Route.get('/games', 'GamesController.index')
Route.get('/games/:id', 'GamesController.show')

Route.group(() => {
  Route.post('/', 'ForgotPasswordsController.store')
  Route.put('/recovery', 'ForgotPasswordsController.update')
}).prefix('/forgot-password')

Route.group(() => {
  Route.post('/create', 'UsersController.create')
  Route.group(() => {
    Route.get('/index', 'UsersController.index')
    Route.put('/update', 'UsersController.update')
    Route.delete('/delete', 'UsersController.destroy')
  }).middleware('auth')
}).prefix('/users')

Route.group(() => {
  Route.group(() => {
    Route.patch('/promote-user/:userId', 'AdminsController.promoteUser')
    Route.patch('/demote-user/:userId', 'AdminsController.demoteUser')
    Route.delete('/delete-user/:userId', 'AdminsController.deleteUser')
    Route.get('/all-users', 'AdminsController.getAllUsers')
  }).prefix('/users')

  Route.group(() => {
    Route.post('/create-game', 'GamesController.store')
    Route.put('/update-game/:id', 'GamesController.update')
    Route.delete('/delete-game/:id', 'GamesController.destroy')
  }).prefix('/games')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('authAdmin')
