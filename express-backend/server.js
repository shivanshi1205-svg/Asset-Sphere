const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());

const DB_PATH = path.join(__dirname, 'db.json');

// --- Helper Functions to Read/Write DB ---
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);
  
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const db = readDB();
    const demoUser = db.users.find(u => u.username === ADMIN_USERNAME) || {
      id: 1,
      name: 'Admin Account',
      username: ADMIN_USERNAME,
      email: 'admin@assetspace.com',
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'
    };
    
    return res.status(200).json({
      status: 'success',
      messages: 'Login successful',
      token: 'jwt_mock_token_assetspace_2026',
      user: {
        id: demoUser.id,
        name: demoUser.name,
        username: demoUser.username,
        email: demoUser.email,
        role: demoUser.role,
        avatar: demoUser.avatar
      }
    });
  } else {
    return res.status(401).json({
      status: 'error',
      messages: 'Invalid username or password'
    });
  }
});

app.post('/api/logout', (req, res) => {
  return res.status(200).json({ status: 'success', messages: 'Logged out successfully' });
});

// --- GENERIC CRUD BUILDER ---
const registerCRUD = (entityName, pluralEndpoint) => {
  const basePath = `/api/v1/${pluralEndpoint}`;

  // Get All
  app.get(basePath, (req, res) => {
    const db = readDB();
    let rows = db[entityName] || [];
    
    // Simple query search support
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      rows = rows.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.serial && item.serial.toLowerCase().includes(q)) ||
        (item.asset_tag && item.asset_tag.toLowerCase().includes(q))
      );
    }
    
    // Status Filter for hardware
    if (entityName === 'hardware' && req.query.status_type && req.query.status_type !== 'All') {
      const st = req.query.status_type;
      rows = rows.filter(item => {
        if (st === 'Deployed') return !!item.assigned_to;
        if (st === 'RTD') return item.status_label?.name === 'Ready to Deploy' && !item.assigned_to;
        if (st === 'Undeployable') return item.status_label?.status_type === 'undeployable';
        if (st === 'Archived') return item.status_label?.status_type === 'archived';
        return true;
      });
    }

    return res.status(200).json({
      total: rows.length,
      rows: rows
    });
  });

  // Get One
  app.get(`${basePath}/:id`, (req, res) => {
    const db = readDB();
    const rows = db[entityName] || [];
    const item = rows.find(x => x.id === parseInt(req.params.id, 10));
    if (item) {
      return res.status(200).json(item);
    }
    return res.status(404).json({ status: 'error', messages: 'Item not found' });
  });

  // Create
  app.post(basePath, (req, res) => {
    const db = readDB();
    const rows = db[entityName] || [];
    const nextId = rows.length > 0 ? Math.max(...rows.map(x => x.id)) + 1 : 1;
    
    // Enrich created item fields
    const newItem = {
      id: nextId,
      ...req.body,
      created_at: { datetime: new Date().toISOString(), formatted: new Date().toISOString().split('T')[0] },
      updated_at: { datetime: new Date().toISOString(), formatted: new Date().toISOString().split('T')[0] }
    };

    // Sub-entity relational resolves for UI
    if (entityName === 'hardware') {
      newItem.status_label = db.statuslabels.find(s => s.id === parseInt(req.body.status_id, 10)) || { id: 2, name: 'Ready to Deploy', status_type: 'deployable' };
      newItem.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || { id: 1, name: 'Laptops' };
      newItem.location = db.locations.find(l => l.id === parseInt(req.body.location_id, 10)) || { id: 1, name: 'Noida HQ' };
      newItem.manufacturer = db.manufacturers.find(m => m.id === parseInt(req.body.manufacturer_id, 10)) || { id: 1, name: 'Apple' };
      newItem.supplier = db.suppliers.find(s => s.id === parseInt(req.body.supplier_id, 10)) || null;
      newItem.company = db.companies.find(c => c.id === parseInt(req.body.company_id, 10)) || null;
      newItem.assigned_to = null;
    } else if (entityName === 'licenses') {
      newItem.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || { id: 3, name: 'Software' };
      newItem.manufacturer = db.manufacturers.find(m => m.id === parseInt(req.body.manufacturer_id, 10)) || { id: 4, name: 'Adobe' };
      newItem.remaining_seats = newItem.seats;
      newItem.free_seats_count = newItem.seats;
    } else if (entityName === 'accessories') {
      newItem.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || { id: 4, name: 'Peripherals' };
      newItem.manufacturer = db.manufacturers.find(m => m.id === parseInt(req.body.manufacturer_id, 10)) || { id: 6, name: 'HP' };
      newItem.remaining = newItem.qty;
      newItem.remaining_qty = newItem.qty;
      newItem.checkouts_count = 0;
    } else if (entityName === 'consumables') {
      newItem.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || { id: 5, name: 'Office Consumables' };
      newItem.manufacturer = db.manufacturers.find(m => m.id === parseInt(req.body.manufacturer_id, 10)) || { id: 6, name: 'HP' };
      newItem.remaining = newItem.qty;
      newItem.remaining_qty = newItem.qty;
      newItem.checkouts_count = 0;
    } else if (entityName === 'components') {
      newItem.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || { id: 6, name: 'Memory Modules' };
      newItem.remaining = newItem.qty;
      newItem.remaining_qty = newItem.qty;
    } else if (entityName === 'users') {
      newItem.name = `${newItem.first_name || ''} ${newItem.last_name || ''}`.trim() || 'User';
      newItem.assets_count = 0;
      newItem.licenses_count = 0;
      newItem.accessories_count = 0;
    }

    rows.unshift(newItem);
    db[entityName] = rows;
    writeDB(db);

    return res.status(200).json({ status: 'success', messages: 'Created successfully', payload: newItem });
  });

  // Update
  app.put(`${basePath}/:id`, (req, res) => {
    const db = readDB();
    const rows = db[entityName] || [];
    const index = rows.findIndex(x => x.id === parseInt(req.params.id, 10));
    
    if (index !== -1) {
      const updated = {
        ...rows[index],
        ...req.body,
        updated_at: { datetime: new Date().toISOString(), formatted: new Date().toISOString().split('T')[0] }
      };

      if (entityName === 'hardware') {
        if (req.body.status_id) updated.status_label = db.statuslabels.find(s => s.id === parseInt(req.body.status_id, 10)) || updated.status_label;
        if (req.body.category_id) updated.category = db.categories.find(c => c.id === parseInt(req.body.category_id, 10)) || updated.category;
        if (req.body.location_id) updated.location = db.locations.find(l => l.id === parseInt(req.body.location_id, 10)) || updated.location;
      } else if (entityName === 'users') {
        updated.name = `${req.body.first_name || rows[index].first_name} ${req.body.last_name || rows[index].last_name}`.trim();
      }

      rows[index] = updated;
      db[entityName] = rows;
      writeDB(db);
      return res.status(200).json({ status: 'success', messages: 'Updated successfully', payload: updated });
    }
    return res.status(404).json({ status: 'error', messages: 'Item not found' });
  });

  // Delete
  app.delete(`${basePath}/:id`, (req, res) => {
    const db = readDB();
    const rows = db[entityName] || [];
    const index = rows.findIndex(x => x.id === parseInt(req.params.id, 10));
    if (index !== -1) {
      rows.splice(index, 1);
      db[entityName] = rows;
      writeDB(db);
      return res.status(200).json({ status: 'success', messages: 'Deleted successfully' });
    }
    return res.status(404).json({ status: 'error', messages: 'Item not found' });
  });
};

// Register all endpoints CRUD
registerCRUD('hardware', 'hardware');
registerCRUD('licenses', 'licenses');
registerCRUD('accessories', 'accessories');
registerCRUD('consumables', 'consumables');
registerCRUD('components', 'components');
registerCRUD('users', 'users');
registerCRUD('locations', 'locations');
registerCRUD('categories', 'categories');
registerCRUD('statuslabels', 'statuslabels');
registerCRUD('companies', 'companies');
registerCRUD('manufacturers', 'manufacturers');
registerCRUD('suppliers', 'suppliers');
registerCRUD('departments', 'departments');

// --- SPECIAL LIFE-CYCLE OPERATIONS ---

// 1. Hardware Checkout
app.post('/api/v1/hardware/:id/checkout', (req, res) => {
  const db = readDB();
  const asset = db.hardware.find(h => h.id === parseInt(req.params.id, 10));
  if (!asset) return res.status(404).json({ status: 'error', messages: 'Asset not found' });

  const userId = parseInt(req.body.assigned_to_user_id, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ status: 'error', messages: 'Assignee user not found' });

  asset.assigned_to = { id: user.id, name: user.name, type: 'user' };
  user.assets_count = (user.assets_count || 0) + 1;

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Asset checked out successfully' });
});

// 2. Hardware Checkin
app.post('/api/v1/hardware/:id/checkin', (req, res) => {
  const db = readDB();
  const asset = db.hardware.find(h => h.id === parseInt(req.params.id, 10));
  if (!asset) return res.status(404).json({ status: 'error', messages: 'Asset not found' });

  if (asset.assigned_to && asset.assigned_to.type === 'user') {
    const user = db.users.find(u => u.id === asset.assigned_to.id);
    if (user && user.assets_count > 0) user.assets_count -= 1;
  }

  asset.assigned_to = null;
  if (req.body.status_id) {
    asset.status_label = db.statuslabels.find(s => s.id === parseInt(req.body.status_id, 10)) || asset.status_label;
  }

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Asset checked in successfully' });
});

// 3. License Checkout Seat
app.post('/api/v1/licenses/:id/checkout', (req, res) => {
  const db = readDB();
  const lic = db.licenses.find(l => l.id === parseInt(req.params.id, 10));
  if (!lic) return res.status(404).json({ status: 'error', messages: 'License not found' });

  if (lic.remaining_seats <= 0) return res.status(400).json({ status: 'error', messages: 'No seats remaining' });

  const userId = parseInt(req.body.assigned_to_user_id, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ status: 'error', messages: 'User not found' });

  lic.remaining_seats -= 1;
  lic.free_seats_count -= 1;
  user.licenses_count = (user.licenses_count || 0) + 1;

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'License seat checked out successfully' });
});

// 4. Accessory Checkout
app.post('/api/v1/accessories/:id/checkout', (req, res) => {
  const db = readDB();
  const acc = db.accessories.find(a => a.id === parseInt(req.params.id, 10));
  if (!acc) return res.status(404).json({ status: 'error', messages: 'Accessory not found' });

  if (acc.remaining <= 0) return res.status(400).json({ status: 'error', messages: 'No stock available' });

  const userId = parseInt(req.body.assigned_to_user_id, 10);
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ status: 'error', messages: 'User not found' });

  acc.remaining -= 1;
  acc.remaining_qty -= 1;
  acc.checkouts_count += 1;
  acc.percent_remaining = Math.round((acc.remaining / acc.qty) * 100);
  user.accessories_count = (user.accessories_count || 0) + 1;

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Accessory checked out successfully' });
});

// 5. Accessory Checkin
app.post('/api/v1/accessories/:id/checkin', (req, res) => {
  const db = readDB();
  const acc = db.accessories.find(a => a.id === parseInt(req.params.id, 10));
  if (!acc) return res.status(404).json({ status: 'error', messages: 'Accessory not found' });

  if (acc.checkouts_count <= 0) return res.status(400).json({ status: 'error', messages: 'None are currently checked out' });

  acc.remaining += 1;
  acc.remaining_qty += 1;
  acc.checkouts_count -= 1;
  acc.percent_remaining = Math.round((acc.remaining / acc.qty) * 100);

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Accessory checked in successfully' });
});

// 6. Consumable Checkout (Consume)
app.post('/api/v1/consumables/:id/checkout', (req, res) => {
  const db = readDB();
  const con = db.consumables.find(c => c.id === parseInt(req.params.id, 10));
  if (!con) return res.status(404).json({ status: 'error', messages: 'Consumable not found' });

  if (con.remaining <= 0) return res.status(400).json({ status: 'error', messages: 'No stock available' });

  con.remaining -= 1;
  con.remaining_qty -= 1;
  con.checkouts_count += 1;
  con.percent_remaining = Math.round((con.remaining / con.qty) * 100);

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Consumable checked out successfully' });
});

// 7. Component Checkout (Assign to Asset)
app.post('/api/v1/components/:id/checkout', (req, res) => {
  const db = readDB();
  const comp = db.components.find(c => c.id === parseInt(req.params.id, 10));
  if (!comp) return res.status(404).json({ status: 'error', messages: 'Component not found' });

  if (comp.remaining <= 0) return res.status(400).json({ status: 'error', messages: 'No components in stock' });

  comp.remaining -= 1;
  comp.remaining_qty -= 1;

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Component checked out successfully' });
});

// 8. Component Checkin
app.post('/api/v1/components/:id/checkin', (req, res) => {
  const db = readDB();
  const comp = db.components.find(c => c.id === parseInt(req.params.id, 10));
  if (!comp) return res.status(404).json({ status: 'error', messages: 'Component not found' });

  if (comp.remaining < comp.qty) {
    comp.remaining += 1;
    comp.remaining_qty += 1;
  }

  writeDB(db);
  return res.status(200).json({ status: 'success', messages: 'Component checked in successfully' });
});


// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`AssetSphere API Backend Server is running!`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
