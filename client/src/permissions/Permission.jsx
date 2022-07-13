import React, { useState, useEffect } from "react";
import axios from "axios";

const Permission = () => {
  const [roleList, setRoleList] = useState([]);
  const [newRole, setNewRole] = useState([]);
  const [permission, setPermission] = useState([]);
  const [user, setUser] = useState([]);
  const [hrole, setHrole] = useState('')

  const getRoles = async () => {
    const { data } = await axios.get(`http://localhost:8000/api/v1/staff/rolePermission`);
    setRoleList(data);
  };
  const handleClick = (event) => {
    let data = [...permission];
    data.forEach((element) => {
      if (event.currentTarget.checked) {
        if (element.permission_id == event.currentTarget.id) {
          element[event.currentTarget.value] = 1;
          setPermission(data);
        }
      } else {
        if (element.permission_id == event.currentTarget.id) {
          element[event.currentTarget.value] = 0;
          setPermission(data);
        }
      }
    });
  };

  
  const addrole = async (e) => {
    e.preventDefault();
    const { data } = await axios
      .post(`http://localhost:8000/api/v1/permission/createPermission`, {
        role: newRole,
      })
      .then(data);
  };

  async function changeFunc(e) {
    const { data } = await axios.post(`http://localhost:8000/api/v1/permission/getPermissions`, {
      role: e.target.value,
    });
    setPermission(data);
  
  }
  let selectUser = []
  const handleUser  = (e) => {
    selectUser.push(e.target.value)
  }

  async function getUsers(e) {
    const { data } = await axios.post(`http://localhost:8000/api/v1/permission/getUser`, {
      role: e.target.value,
    });
    setUser(data);
    setHrole( e.target.value)
  }
const updateRole = async (e) =>{
    const data = await axios.post(`http://localhost:8000/api/v1/permission/updateStaffPermission`,{
      permission : permission,
      role: hrole,
      user_id : selectUser
    }).then(data)
  }

  useEffect(() => {
    getRoles(); //List of all users
    handleClick();
    const  fatchdata  = async()=>{
     const {data} = await axios.post(`http://localhost:8000/api/v1/permission/getPermissions`, {
        role:  "Admin",
      });
      setPermission(data);
    } 
    fatchdata();
  }, []);
  return (
    <div>
      Create Role
      <div>
        <select
          onChange={(e) => {
            changeFunc(e);
            getUsers(e);
          }}
        >
          {roleList.map((obj, i) => (
            <option value={obj.role}>{obj.role}</option>
          ))}
        </select>
      </div>
      <form onSubmit={addrole}>
        <input
          className="input"
          type="text"
          name="text"
          placeholder="Create A NEW ROLE"
          onChange={(e) => setNewRole(e.target.value)}
        />
        <input type="submit" text="sumbit" />
      </form>
      <div>
      <form onSubmit={ updateRole}>
        <table className="table table-bordered bg-info m-2">
          <thead>
            <tr>
              <th>ID</th>
              <th>Permissionid</th>
              <th>Can_View</th>
              <th>Can_View_Own</th>
              <th>Can_Edit</th>
              <th>Can_Create</th>
              <th>Can_Delete</th>
            </tr>
          </thead>
          <tbody>
         
            {permission.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.permission_id}</td>
                <td>
                  <input
                    type="checkbox"
                    id={item.permission_id}
                    value="can_view"
                    checked={item.can_view == 1 ? true : false}
                    onChange={handleClick}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    id={item.permission_id}
                    value="can_view_own"
                    checked={item.can_view_own == 1 ? true : false}
                    onChange={handleClick}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    value="can_edit"
                    id={item.permission_id}
                    checked={item.can_edit == 1 ? true : false}
                    onChange={handleClick}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    value="can_create"
                    id={item.permission_id}
                    checked={item.can_create == 1 ? true : false}
                    onChange={handleClick}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    value="can_delete"
                    id={item.permission_id}
                    checked={item.can_delete == 1 ? true : false}
                    onChange={handleClick}
                  />
                </td>
              </tr>
            ))}
            <input className="m-5" type="submit" />
          </tbody>
        </table>
        <div>
       
            {user.map((obj, i) => (
              <>
                <label className="m-1 p-1">{obj.email}</label>
                <input
                  type="checkbox"
                  value={obj.id}
                  name={obj.id}
                  onChange={handleUser}
                />
              </>
            ))}
        
        </div>
        </form>
      </div>
      
    </div>
  );
};

export default Permission;
