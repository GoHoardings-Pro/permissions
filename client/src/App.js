import './App.css';
import Permission from './permissions/Permission';
import Staff_list from './permissions/Staff_list';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>     
      <BrowserRouter>
    <Routes>
        <Route index  element={<Staff_list/>} />
        <Route exact path='/permisssion' element={<Permission/>} />
    </Routes>
  </BrowserRouter>
    </div>
  );
}

export default App;
