var express = require('express');
var router = express.Router();
let { users, roles } = require('../utils/data');
let { IncrementalId } = require('../utils/IncrementalIdHandler');

// ==================== SPECIAL ENDPOINTS (Must be before /:id) ====================

// ENABLE user account
///api/v1/users/enable (POST)
router.post('/enable', function (req, res, next) {
  if (!req.body.email || !req.body.username) {
    return res.status(400).send({ message: "Email and username are required" });
  }

  let result = users.find(function (e) {
    return (!e.isDeleted) &&
      e.email.toLowerCase() === req.body.email.toLowerCase() &&
      e.username.toLowerCase() === req.body.username.toLowerCase();
  });

  if (!result) {
    return res.status(404).send({ message: "User not found or credentials do not match" });
  }

  result.status = true;
  result.updatedAt = new Date(Date.now());
  res.status(200).send({ message: "User account enabled", user: result });
});

// DISABLE user account
///api/v1/users/disable (POST)
router.post('/disable', function (req, res, next) {
  if (!req.body.email || !req.body.username) {
    return res.status(400).send({ message: "Email and username are required" });
  }

  let result = users.find(function (e) {
    return (!e.isDeleted) &&
      e.email.toLowerCase() === req.body.email.toLowerCase() &&
      e.username.toLowerCase() === req.body.username.toLowerCase();
  });

  if (!result) {
    return res.status(404).send({ message: "User not found or credentials do not match" });
  }

  result.status = false;
  result.updatedAt = new Date(Date.now());
  res.status(200).send({ message: "User account disabled", user: result });
});

// ==================== ROLES CRUD (Must be BEFORE users routes) ====================

// GET all roles
///api/v1/users/roles
router.get('/roles', function (req, res, next) {
  let nameQ = req.query.name ? req.query.name : '';
  let result = roles.filter(function (e) {
    return (!e.isDeleted) &&
      e.name.toLowerCase().includes(nameQ.toLowerCase())
  });
  res.status(200).send(result);
});

// CREATE new role
///api/v1/users/roles (POST)
router.post('/roles', function (req, res, next) {
  // Validate required fields
  if (!req.body.name) {
    return res.status(400).send({ message: "Role name is required" });
  }

  // Check if role name already exists
  let existingRole = roles.find(e => !e.isDeleted && e.name.toLowerCase() === req.body.name.toLowerCase());
  if (existingRole) {
    return res.status(400).send({ message: "Role name already exists" });
  }

  let newRole = {
    id: Math.max(...roles.map(r => r.id), 0) + 1,
    name: req.body.name,
    description: req.body.description || "",
    isDeleted: false,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  };

  roles.push(newRole);
  res.status(201).send(newRole);
});

// GET role by ID
///api/v1/users/roles/:id (GET)
router.get('/roles/:id', function (req, res, next) {
  let result = roles.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ message: "ROLE NOT FOUND" });
  }
});

// UPDATE role
///api/v1/users/roles/:id (PUT)
router.put('/roles/:id', function (req, res, next) {
  let result = roles.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "ROLE NOT FOUND" });
  }

  // Check if new name already exists (if name is being updated)
  if (req.body.name && req.body.name !== result.name) {
    let existingRole = roles.find(e => !e.isDeleted && e.id != req.params.id && e.name.toLowerCase() === req.body.name.toLowerCase());
    if (existingRole) {
      return res.status(400).send({ message: "Role name already exists" });
    }
  }

  if (req.body.name) result.name = req.body.name;
  if (req.body.description !== undefined) result.description = req.body.description;
  result.updatedAt = new Date(Date.now());

  res.status(200).send(result);
});

// DELETE role (soft delete)
///api/v1/users/roles/:id (DELETE)
router.delete('/roles/:id', function (req, res, next) {
  let result = roles.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "ROLE NOT FOUND" });
  }

  result.isDeleted = true;
  result.updatedAt = new Date(Date.now());
  res.status(200).send({ message: "Role deleted successfully", role: result });
});

// ==================== USERS CRUD ====================

// GET all users
///api/v1/users
router.get('/', function (req, res, next) {
  let emailQ = req.query.email ? req.query.email : '';
  let usernameQ = req.query.username ? req.query.username : '';
  let result = users.filter(function (e) {
    return (!e.isDeleted) &&
      e.email.toLowerCase().includes(emailQ.toLowerCase()) &&
      e.username.toLowerCase().includes(usernameQ.toLowerCase())
  });
  res.status(200).send(result);
});

// CREATE new user
///api/v1/users (POST)
router.post('/', function (req, res, next) {
  // Validate required fields
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.status(400).send({ message: "Username, password, and email are required" });
  }

  // Check if username already exists
  let existingUsername = users.find(e => !e.isDeleted && e.username.toLowerCase() === req.body.username.toLowerCase());
  if (existingUsername) {
    return res.status(400).send({ message: "Username already exists" });
  }

  // Check if email already exists
  let existingEmail = users.find(e => !e.isDeleted && e.email.toLowerCase() === req.body.email.toLowerCase());
  if (existingEmail) {
    return res.status(400).send({ message: "Email already exists" });
  }

  let newUser = {
    id: Math.max(...users.map(u => u.id), 0) + 1,
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    fullName: req.body.fullName || "",
    avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
    status: req.body.status || false,
    role: req.body.role || 3,
    loginCount: req.body.loginCount || 0,
    isDeleted: false,
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  };

  users.push(newUser);
  res.status(201).send(newUser);
});

// GET user by ID
///api/v1/users/:id (GET)
router.get('/:id', function (req, res, next) {
  let result = users.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ message: "USER NOT FOUND" });
  }
});

// UPDATE user
///api/v1/users/:id (PUT)
router.put('/:id', function (req, res, next) {
  let result = users.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "USER NOT FOUND" });
  }

  // Check if new username already exists (if username is being updated)
  if (req.body.username && req.body.username !== result.username) {
    let existingUsername = users.find(e => !e.isDeleted && e.id != req.params.id && e.username.toLowerCase() === req.body.username.toLowerCase());
    if (existingUsername) {
      return res.status(400).send({ message: "Username already exists" });
    }
  }

  // Check if new email already exists (if email is being updated)
  if (req.body.email && req.body.email !== result.email) {
    let existingEmail = users.find(e => !e.isDeleted && e.id != req.params.id && e.email.toLowerCase() === req.body.email.toLowerCase());
    if (existingEmail) {
      return res.status(400).send({ message: "Email already exists" });
    }
  }

  // Update allowed fields
  if (req.body.username) result.username = req.body.username;
  if (req.body.password) result.password = req.body.password;
  if (req.body.email) result.email = req.body.email;
  if (req.body.fullName !== undefined) result.fullName = req.body.fullName;
  if (req.body.avatarUrl !== undefined) result.avatarUrl = req.body.avatarUrl;
  if (req.body.role !== undefined) result.role = req.body.role;
  if (req.body.loginCount !== undefined) result.loginCount = req.body.loginCount;

  result.updatedAt = new Date(Date.now());

  res.status(200).send(result);
});

// DELETE user (soft delete)
///api/v1/users/:id (DELETE)
router.delete('/:id', function (req, res, next) {
  let result = users.find(function (e) {
    return (!e.isDeleted) && e.id == req.params.id;
  });

  if (!result) {
    return res.status(404).send({ message: "USER NOT FOUND" });
  }

  result.isDeleted = true;
  result.updatedAt = new Date(Date.now());
  res.status(200).send({ message: "User deleted successfully", user: result });
});

module.exports = router;
