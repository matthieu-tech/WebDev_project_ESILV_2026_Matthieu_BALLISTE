db = db.getSiblingDB('myapp')

db.createUser({
  user: 'stan',
  pwd: 'stan',
  roles: [{ role: 'dbOwner', db: 'myapp' }],
})

db.createUser({
  user: 'matth',
  pwd: 'mdp',
  roles: [{ role: 'dbOwner', db: 'myapp' }],
})
