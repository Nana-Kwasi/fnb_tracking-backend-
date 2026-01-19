import { useState, useEffect } from 'react'
import api from '../services/api'
import UserModal from '../components/UserModal'
import './Users.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleSuccess = () => {
    setShowModal(false)
    setEditingUser(null)
    fetchUsers()
  }

  const handleDelete = async (userId) => {
    await api.delete(`/api/users/${userId}`)
    fetchUsers()
  }

  const handleSuspend = async (user) => {
    await api.put(`/api/users/${user.id}`, {
      ...user,
      isActive: !user.isActive
    })
    fetchUsers()
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Admin Users</h2>
        <button className="primary-button" onClick={handleCreate}>
          + Add Admin User
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>F-Number</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fNumber || user.fnumber || 'N/A'}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-button"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
          onSuccess={handleSuccess}
          onDelete={handleDelete}
          onSuspend={handleSuspend}
        />
      )}
    </div>
  )
}

export default Users
