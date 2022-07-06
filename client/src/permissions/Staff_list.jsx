import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";
import { Pagination, Result } from "antd";

Modal.setAppElement("#root");
const Staff_list = () => {
  const [roleList, setRoleList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [modalisopen, setmodalisopen] = useState(false);
  const [edit, setedit] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [mess, setMess] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [permission, setPermission] = useState([]);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState([]);
  const [page, setPage] = useState(1);
  const [postPerpage, setPostPerPage] = useState(10);

 

  // getting data from server
  const getDATA = async () => {
    const { data } = await axios.get("http://localhost:300/");
    setPosts(data);
    setTotal(data.length);
  };
console.log(posts);
  useEffect(() => {
    getDATA(); //List of all users
    addStaff()
    updateuser()
    getRoles()
  }, []);

  // changing value of inputs
  const changehandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // make a new user
  const addStaff = async () => {
    console.log(email, password, role);
    const { data } = await axios.post("http://localhost:300/create", {
      email: email,
      password: password,
      role: role,
    });
    if (data == true) {
      setMess(data.message);
    } else {
      setMess(data.message);
    }
  };
  // functin for hge toggle funtionality
  const toggle = async (id) => {
    const { data } = await axios.post("http://localhost:300/toggle", {
      id: id,
    });
    setPosts(data);
  };

  const permissions = () => {
    navigate("./permisssion");
  };
  // update A user
  async function updateuser(e, id) {
    e.preventDefault();
    const { data } = await axios.post(`http://localhost:300/update/${id}`, {
      email: user.email,
      password: user.password,
      role: user.role,
    });
 setPosts(data) 
  }

  const handleClick = (event) => {  
    let data = [...permission]
      data.forEach((element) => {
        if (event.currentTarget.checked) {
          if (element.permission_id == event.currentTarget.id) {
            element[event.currentTarget.value] = 1;
        setPermission(data)
      }
        } else {
          if (element.permission_id == event.currentTarget.id) {
            element[event.currentTarget.value] = 0;
            setPermission(data)
      }
        }
      });
}
  async function updatePermission() {
    const {data} = await axios.post(`http://localhost:300/updatePermission`,{
      permission : permission,
      role: user.role,
      id : user.id
    }).then(data)
  }

  async function changeFunc(e) {
    const { data } = await axios.post(`http://localhost:300/permission`, {
      role: e.target.value,
      id: user.id,
    });
    setPermission(data);

  }
  const indexOfLastPage = page * postPerpage;
  const indexOfFirstPage = indexOfLastPage - postPerpage;
  const currentPosts = posts.slice(indexOfFirstPage, indexOfLastPage);

  const onShowSizeChange = (current, pageSize) => {
    setPostPerPage(pageSize);
  };

  const itemRender = (current, type, originalElement) => {
    if (type === "prev") {
      return <a>Previous</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
  };

  const getRoles = async () => {
    const { data } = await axios.get(`http://localhost:300/getRoles`);
    setRoleList(data);
  };

  return (
    <div>
      <center className="m-1 p-1">
        <button className="m-1 p-1" onClick={() => setmodalisopen(true)}>
          Create Profile
        </button>
        <input
          placeholder="Enter Post Title"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="btn m-1 p-1 float-left" onClick={permissions}>
          Create Role
        </button>
      </center>
      <Modal isOpen={modalisopen}>
        <div>
          <div className="row m-5 p-5">
            <div className="field m-2 p-2">
              <label>Email</label>
              <input type="text" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field m-2 p-2">
              <label>Password</label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field m-2 p-2">
              <label>Role</label>
              <select id="selectBox" onChange={(e) => setRole(e.target.value)}>
              {roleList.map((obj, i) => (
            <option value={obj.role}>{obj.role}</option>
          ))}
              </select>
            </div>
            <div className="m-2 p-2">
              <button type="submit" className="Button" onClick={addStaff}>
                Create User
              </button>
              <h3>{mess}</h3>
            </div>
          </div>
        </div>
        <button className="m-5" onClick={() => setmodalisopen(false)}>
          Close
        </button>
      </Modal>
      <table className="table table-boarder table-hover table-striped m-3 table-sm">
        <thead className="thead-dark">
          <tr>
            <th>S.No</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Edit</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {/* map funtion on all data */}
          {currentPosts
            .filter((obj) => {
              if (query == "") {
                return obj;
              } else if (
                obj.password.toLowerCase().includes(query.toLowerCase()) ||
                obj.email.toLowerCase().includes(query.toLowerCase()) ||
                obj.role.toLowerCase().includes(query.toLowerCase())
              ) {
                return obj;
              }
            })
            .map((obj, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{obj.email}</td>
                <td>{obj.password}</td>
                <td>{obj.role}</td>
                {/* opening model for a specific user by identify te id */}
                <td>
                  {" "}
                  <button
                    onClick={() => {
                      setedit(true);
                      setUser(obj);
                    }}
                  >
                    Edit
                  </button>{" "}
                </td>
                <td>
                  <Switch
                    onChange={() => toggle(obj.id)}
                    checked={obj.toggle == 0 ? true : false}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div>
        {/* Edit profile Model */}
        <Modal isOpen={edit}>
          <div className="container">
            <div className="row">
              <div className="col-4">
                {/* by form we try to get old values nad update them */}
                <form onSubmit={(e) => updateuser(e, user.id)}>
                  <div className="field m-2 p-2">
                    <label>Email</label>
                    <input
                      className="input"
                      type="text"
                      placeholder={email}
                      name="email"
                      value={user.email || ""}
                      onChange={(e) => changehandler(e)}
                    />
                  </div>
                  <div className="field m-2 p-2">
                    <label>Password</label>
                    <input
                      className="input"
                      type="text"
                      placeholder={password}
                      name="password"
                      value={user.password || ""}
                      onChange={(e) => changehandler(e)}
                    />
                  </div>
                  <div className="field m-2 p-2">
                    <label>Role</label>
                    <select
                      id="selectBox"
                      onChange={(e) => {
                        changehandler(e);
                        changeFunc(e);
                      }}
                      className="input"
                      name="role"
                      value={user.role || ""}>
                      {roleList.map((obj, i) => (
            <option value={obj.role}>{obj.role}</option>
          ))}
                    </select>
                  </div>
                  <div className="field m-2 p-2">
                    <h3>{user.mess}</h3>
                  </div>
                  <input type="submit"></input>
                </form>
                <button onClick={() => setedit(false)}>Close</button>
              </div>
              <div className="col-4">
                <form onSubmit={(e) => updatePermission(e, permission.permission_id)}>
                  <table className="table table-bordered bg-info ">
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
                              checked={ item.can_view || false }
                              onChange={handleClick} />
                          </td> 
                         <td>
                            <input
                              type="checkbox"
                              id={item.permission_id}
                              value="can_view_own"
                              checked={ item.can_view_own || false }
                              onChange={handleClick}/>
                          </td>
                           <td>
                            <input
                              type="checkbox"
                              value="can_edit"
                              id={item.permission_id}
                              checked={ item.can_edit || false }
                              onChange={handleClick}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="can_create"
                              id={item.permission_id}
                              checked={ item.can_create || false }
                              onChange={handleClick}
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              value="can_delete"
                              id={item.permission_id}
                              checked={ item.can_delete || false }
                              onChange={ handleClick}
                            />
                          </td> 
                        </tr>
                      ))}
                      <input className="m-5" type="submit"/>
                    </tbody>
                  </table>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      </div>
      <div className="pagination">
        <Pagination
          onChange={(value) => setPage(value)}
          pageSize={postPerpage}
          total={total}
          current={page}
          showSizeChanger
          showQuickJumper
          onShowSizeChange={onShowSizeChange}
          itemRender={itemRender}
        />
      </div>
    </div>
  );
};

export default Staff_list;
