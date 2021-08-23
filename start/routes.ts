import Route from '@ioc:Adonis/Core/Route'

Route.post('/session', 'SessionsController.store')

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
  Route.patch('/promote-user/:userId', 'AdminsController.promoteUser')
  Route.patch('/demote-user/:userId', 'AdminsController.demoteUser')
  Route.delete('/delete-user/:userId', 'AdminsController.delete')
  Route.get('/all-users', 'AdminsController.getAllUsers')
})
  .prefix('/admin')
  .middleware('auth')
  .middleware('authAdmin')
