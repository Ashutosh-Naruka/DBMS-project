# Database ER Model and Relational Model
## College Canteen Manager System

---

## 1. Entity-Relationship (ER) Model

### Entities and Their Attributes

#### 1.1 USER Entity
- **Primary Key:** userId (ObjectId)
- **Attributes:**
  - name (String, max 50 chars)
  - email (String, unique, validated)
  - passwordHash (String, encrypted)
  - role (Enum: 'student', 'staff', 'admin')
  - refreshToken (String, for authentication)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)

#### 1.2 MENUITEM Entity
- **Primary Key:** itemId (ObjectId)
- **Attributes:**
  - name (String, max 100 chars)
  - description (String, max 500 chars)
  - category (Enum: 'snacks', 'drinks', 'meals', 'desserts', 'beverages')
  - price (Number, min 0)
  - isVeg (Boolean)
  - availableStock (Number, min 0)
  - imageURL (String)
  - isActive (Boolean)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)

#### 1.3 ORDER Entity
- **Primary Key:** orderId (ObjectId)
- **Foreign Keys:** 
  - userId (references USER)
- **Attributes:**
  - orderToken (String, unique)
  - items (Array of OrderItem)
  - paymentMode (Enum: 'counter', 'online')
  - totalAmount (Number, min 0)
  - status (Enum: 'Placed', 'In Preparation', 'Ready', 'Completed', 'Cancelled')
  - statusHistory (Array of status changes with timestamps)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)

#### 1.4 ORDER_ITEM Sub-Entity (Embedded in Order)
- **Attributes:**
  - itemId (ObjectId, references MENUITEM)
  - name (String)
  - price (Number, min 0)
  - qty (Number, min 1)

#### 1.5 COUNTER Entity (Utility)
- **Primary Key:** counterId (ObjectId)
- **Attributes:**
  - name (String, unique)
  - seq (Number, for auto-incrementing)

---

## 2. Relationships

### 2.1 USER ↔ ORDER (One-to-Many)
- **Relationship Type:** One user can place many orders
- **Cardinality:** 1:N
- **Foreign Key:** userId in ORDER references USER._id
- **Description:** Each order is placed by exactly one user, but a user can place multiple orders over time

### 2.2 ORDER ↔ MENUITEM (Many-to-Many)
- **Relationship Type:** An order can contain many menu items, and a menu item can appear in many orders
- **Cardinality:** M:N
- **Implementation:** Through embedded ORDER_ITEM sub-documents in ORDER
- **Description:** Orders contain an array of order items, each referencing a menu item with quantity and price snapshot

---

## 3. ER Diagram (Textual Representation)

```
┌─────────────────┐
│      USER       │
├─────────────────┤
│ PK: userId      │
│    name         │
│    email (U)    │
│    passwordHash │
│    role         │
│    refreshToken │
│    timestamps   │
└────────┬────────┘
         │
         │ places (1:N)
         │
         ▼
┌─────────────────┐           ┌──────────────────┐
│     ORDER       │ contains  │    ORDER_ITEM    │
├─────────────────┤ (1:N)     ├──────────────────┤
│ PK: orderId     │◄──────────│ FK: itemId       │
│ FK: userId      │           │     name         │
│    orderToken(U)│           │     price        │
│    paymentMode  │           │     qty          │
│    totalAmount  │           └────────┬─────────┘
│    status       │                    │
│    statusHistory│                    │ references
│    timestamps   │                    │
└─────────────────┘                    ▼
                              ┌──────────────────┐
                              │    MENUITEM      │
                              ├──────────────────┤
                              │ PK: itemId       │
                              │    name          │
                              │    description   │
                              │    category      │
                              │    price         │
                              │    isVeg         │
                              │    availableStock│
                              │    imageURL      │
                              │    isActive      │
                              │    timestamps    │
                              └──────────────────┘

┌─────────────────┐
│    COUNTER      │  (Utility Table)
├─────────────────┤
│ PK: counterId   │
│    name (U)     │
│    seq          │
└─────────────────┘
```

**Legend:**
- PK: Primary Key
- FK: Foreign Key
- U: Unique Constraint
- (1:N): One-to-Many relationship
- (M:N): Many-to-Many relationship

---

## 4. Relational Model (Schema)

### 4.1 USER Relation
```
USER(
  userId: ObjectId [PK],
  name: VARCHAR(50) [NOT NULL],
  email: VARCHAR(255) [NOT NULL, UNIQUE],
  passwordHash: VARCHAR(255) [NOT NULL],
  role: ENUM('student', 'staff', 'admin') [DEFAULT 'student'],
  refreshToken: VARCHAR(500),
  createdAt: TIMESTAMP [DEFAULT NOW()],
  updatedAt: TIMESTAMP [DEFAULT NOW()]
)
```

### 4.2 MENUITEM Relation
```
MENUITEM(
  itemId: ObjectId [PK],
  name: VARCHAR(100) [NOT NULL],
  description: VARCHAR(500),
  category: ENUM('snacks', 'drinks', 'meals', 'desserts', 'beverages') [NOT NULL],
  price: DECIMAL(10,2) [NOT NULL, CHECK >= 0],
  isVeg: BOOLEAN [DEFAULT TRUE],
  availableStock: INT [NOT NULL, CHECK >= 0, DEFAULT 0],
  imageURL: VARCHAR(500),
  isActive: BOOLEAN [DEFAULT TRUE],
  createdAt: TIMESTAMP [DEFAULT NOW()],
  updatedAt: TIMESTAMP [DEFAULT NOW()]
)
```

### 4.3 ORDER Relation
```
ORDER(
  orderId: ObjectId [PK],
  userId: ObjectId [FK REFERENCES USER(userId), NOT NULL],
  orderToken: VARCHAR(50) [NOT NULL, UNIQUE],
  items: ARRAY[OrderItem] [NOT NULL, CHECK LENGTH > 0],
  paymentMode: ENUM('counter', 'online') [NOT NULL, DEFAULT 'counter'],
  totalAmount: DECIMAL(10,2) [NOT NULL, CHECK >= 0],
  status: ENUM('Placed', 'In Preparation', 'Ready', 'Completed', 'Cancelled') 
          [DEFAULT 'Placed'],
  statusHistory: ARRAY[{status: STRING, timestamp: TIMESTAMP}],
  createdAt: TIMESTAMP [DEFAULT NOW()],
  updatedAt: TIMESTAMP [DEFAULT NOW()]
)
```

### 4.4 ORDER_ITEM Sub-Document (Embedded in ORDER)
```
ORDER_ITEM(
  itemId: ObjectId [REFERENCES MENUITEM(itemId)],
  name: VARCHAR(100) [NOT NULL],
  price: DECIMAL(10,2) [NOT NULL, CHECK >= 0],
  qty: INT [NOT NULL, CHECK >= 1]
)
```

### 4.5 COUNTER Relation
```
COUNTER(
  counterId: ObjectId [PK],
  name: VARCHAR(100) [NOT NULL, UNIQUE],
  seq: INT [DEFAULT 0]
)
```

---

## 5. Functional Dependencies

### 5.1 USER Table
- userId → name, email, passwordHash, role, refreshToken, createdAt, updatedAt
- email → userId (due to UNIQUE constraint)

### 5.2 MENUITEM Table
- itemId → name, description, category, price, isVeg, availableStock, imageURL, isActive, createdAt, updatedAt

### 5.3 ORDER Table
- orderId → userId, orderToken, items, paymentMode, totalAmount, status, statusHistory, createdAt, updatedAt
- orderToken → orderId (due to UNIQUE constraint)

### 5.4 COUNTER Table
- counterId → name, seq
- name → seq (due to UNIQUE constraint)

---

## 6. Normalization Analysis

### Current Normalization Level: **3NF (Third Normal Form)**

#### 6.1 First Normal Form (1NF) ✓
- All attributes contain atomic values
- Each column contains values of a single type
- Each column has a unique name
- Order of rows/columns doesn't matter

#### 6.2 Second Normal Form (2NF) ✓
- Already in 1NF
- No partial dependencies (all non-key attributes fully depend on primary key)
- All tables have single-attribute primary keys (ObjectId)

#### 6.3 Third Normal Form (3NF) ✓
- Already in 2NF
- No transitive dependencies
- All non-key attributes depend only on primary key

**Note:** The ORDER_ITEM embedded structure contains denormalized data (name, price) for performance and historical accuracy, which is acceptable in NoSQL databases like MongoDB.

---

## 7. Database Design Decisions

### 7.1 Embedding vs Referencing
- **ORDER_ITEM is embedded** in ORDER: Improves read performance, maintains price history
- **USER and MENUITEM are referenced**: Allows independent updates and maintains data consistency

### 7.2 Denormalization in ORDER_ITEM
- Stores item name and price at order time
- **Reason:** Preserves historical pricing even if menu item prices change
- **Trade-off:** Slight data redundancy for better historical accuracy

### 7.3 Status History Array
- Embedded array tracks all status changes
- **Benefit:** Complete audit trail without additional table
- **Use Case:** Track order lifecycle for analytics and customer service

---

## 8. Cardinality Summary

| Relationship | Type | Cardinality | Description |
|-------------|------|-------------|-------------|
| USER → ORDER | One-to-Many | 1:N | One user can place many orders |
| ORDER → ORDER_ITEM | One-to-Many | 1:N | One order contains many items |
| MENUITEM ← ORDER_ITEM | One-to-Many | 1:N | One menu item appears in many orders |
| ORDER ↔ MENUITEM | Many-to-Many | M:N | Through ORDER_ITEM relationship |

---

## 9. Document Structure (MongoDB)

### 9.1 Sample USER Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@college.com",
  "passwordHash": "$2a$10$...",
  "role": "student",
  "refreshToken": "eyJhbGci...",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 9.2 Sample ORDER Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "orderToken": "1001",
  "items": [
    {
      "itemId": ObjectId("507f1f77bcf86cd799439013"),
      "name": "Samosa",
      "price": 20,
      "qty": 2
    },
    {
      "itemId": ObjectId("507f1f77bcf86cd799439014"),
      "name": "Coffee",
      "price": 30,
      "qty": 1
    }
  ],
  "paymentMode": "counter",
  "totalAmount": 70,
  "status": "Placed",
  "statusHistory": [
    {
      "status": "Placed",
      "timestamp": ISODate("2024-01-15T11:00:00Z")
    }
  ],
  "createdAt": ISODate("2024-01-15T11:00:00Z"),
  "updatedAt": ISODate("2024-01-15T11:00:00Z")
}
```

### 9.3 Sample MENUITEM Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "name": "Samosa",
  "description": "Crispy potato-filled samosa",
  "category": "snacks",
  "price": 20,
  "isVeg": true,
  "availableStock": 50,
  "imageURL": "https://example.com/samosa.jpg",
  "isActive": true,
  "createdAt": ISODate("2024-01-10T09:00:00Z"),
  "updatedAt": ISODate("2024-01-15T08:30:00Z")
}
```
