import { Route, Routes, Navigate } from 'react-router-dom';
import Main from './components/Main';
import Signup from './components/Signup';
import Login from './components/Login';
import Pomodoro from './components/Pomodoro';
import Todo from './components/Todo';
import ImportantTodo from './components/ImportantTodo';
import CompletedTodo from './components/CompletedTasks';
import Calendar from './components/Calendar';
import DataVis from './components/DataVis';
import Help from './components/Help';
import Shop from './components/Shop';

function App() {
  const user = localStorage.getItem("token")
  return (
    <Routes>
      {user && <Route path="/" exact element={<Main/>}/>}
      <Route path="/signup" exact element={<Signup/>}/>
      <Route path="/login" exact element={<Login/>}/>
      <Route path="/pomodoro" exact element={<Pomodoro/>}/>
      <Route path="/todo" exact element={<Todo/>}/>
      <Route path="/importantTodo" exact element={<ImportantTodo/>}/>
      <Route path="/completedTodo" exact element={<CompletedTodo/>}/>
      <Route path="/calendar" exact element={<Calendar/>}/>
      <Route path="/dataVis" exact element={<DataVis/>}/>
      <Route path="/help" exact element={<Help/>}/>
      <Route path="/shop" exact element={<Shop/>}/>
      <Route path="/main" exact element={<Main/>}/>
      <Route path="/" exact element={<Navigate replace to="/login"/>}/>
    </Routes>
  );
}

export default App;
