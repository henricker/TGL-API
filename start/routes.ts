import Route from '@ioc:Adonis/Core/Route'

Route.post('/session', 'SessionsController.store')

Route.group(() => {
  Route.post('/create', 'UsersController.create')
  Route.group(() => {
    Route.get('/index', 'UsersController.index')
    Route.put('/update', 'UsersController.update')
    Route.delete('/delete', 'UsersController.destroy')
  }).middleware('auth')
}).prefix('/users')

Route.group(() => {
  Route.post('/', 'ForgotPasswordsController.store')
  Route.put('/recovery', 'ForgotPasswordsController.update')
}).prefix('/forgot-password')
