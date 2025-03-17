import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db, logout } from "../firebase";
import {
  Button,
  Box,
  Container,
  AppBar,
  Stack,
  Avatar,
  Typography,
  TextField,
  useMediaQuery,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Using Grid v2 instead of deprecated Grid
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { useTheme } from "@mui/material/styles";

// Removing icon imports that caused errors
// We'll use text labels instead of icons

const ToDoObj = ({ task, onMarkDone, onDelete, onEdit }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const stackProps = {
    direction: matches ? "column" : "row",
  };

  return (
    <Stack
      direction="row"
      flexGrow={1}
      sx={{
        padding: "10px",
        border: "1px solid",
        borderColor: "primary.light",
        margin: "5px",
        borderRadius: "10px",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{ wordBreak: "break-word", padding: "0 10px" }}
      >
        {task.name}
      </Typography>
      <Stack
        {...stackProps}
        justifyContent="flex-end"
        spacing={1}
        direction="row"
      >
        {!task.completed && (
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => onMarkDone(task.id)}
          >
            Done
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </Stack>
    </Stack>
  );
};

const Todolist = () => {
  const [name, setName] = useState(sessionStorage.getItem("userID") || "");
  const [username, setUsername] = useState("");

  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchUsername = async (userId) => {
    try {
      // Reference to the user document in the "users" collection
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Return the username from the user document
        return (
          userSnap.data().username || userSnap.data().displayName || userId
        );
      } else {
        console.log("No user document found for ID:", userId);
        return userId; // Fallback to using the ID if no document found
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      return userId; // Return the user ID as fallback in case of error
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userID");
      if (!userId) {
        console.error("No user ID found");
        setLoading(false);
        return;
      }

      const q = query(collection(db, "tasks"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const taskList = [];
      querySnapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() });
      });

      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.trim()) return;

    try {
      const userId = sessionStorage.getItem("userID");
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const taskData = {
        name: newTask,
        completed: false,
        userId: userId,
        createdAt: new Date(),
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "tasks"), taskData);

      // Update local state
      setTasks([...tasks, { id: docRef.id, ...taskData }]);
      setNewTask("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const markTaskAsDone = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        completed: true,
        completedAt: new Date(),
      });

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));

      // Update local state
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
    setNewTask(task.name);
  };

  const updateTask = async () => {
    if (!editingTask || !newTask.trim()) return;

    try {
      const taskRef = doc(db, "tasks", editingTask.id);
      await updateDoc(taskRef, {
        name: newTask,
      });

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...task, name: newTask } : task
        )
      );

      // Reset editing state
      setEditingTask(null);
      setNewTask("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTask("");
  };

  const handleSignOut = () => {
    logout();
    sessionStorage.clear();
    navigate("/");
  };

  const todoTasks = tasks.filter((task) => !task.completed);
  const doneTasks = tasks.filter((task) => task.completed);

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Stack spacing={2} direction="row">
              <Link to="/" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary">
                  Home
                </Button>
              </Link>
              <Button variant="contained" color="primary">
                Edit Profile
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
      </Box>

      <Box display="flex" justifyContent="center" sx={{ flexGrow: 1 }}>
        <Stack
          display="flex"
          alignItems="center"
          sx={{ width: "100%", paddingTop: "20px", paddingBottom: "40px" }}
        >
          <Avatar
            alt={name}
            sx={{ width: 100, height: 100, bgcolor: "primary.main", mb: 2 }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="h4" sx={{ mb: 4 }} color="White">
            {username ? `${username}'s To Do List` : "My To Do List"}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: "100%", mb: 4 }}
          >
            <TextField
              label={editingTask ? "Edit Task" : "Enter a Task"}
              variant="standard"
              fullWidth
              value={newTask}
              sx={{ borderRadius: "4px" }}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  editingTask ? updateTask() : createTask();
                }
              }}
              variant="filled"
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: "20px",
              }}
            />
            {editingTask ? (
              <Stack
                direction={{ xs: "row" }}
                spacing={1}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={matches}
                  onClick={updateTask}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  fullWidth={matches}
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                fullWidth={matches}
                sx={{ width: { xs: "100%", sm: "auto" } }}
                onClick={createTask}
              >
                Add Task
              </Button>
            )}
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" width="100%" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* To Do Section */}
              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    height: "100%",
                    minHeight: "300px",
                  }}
                >
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{ mb: 2, fontWeight: "bold" }}
                  >
                    TO DO ({todoTasks.length})
                  </Typography>
                  <Stack
                    sx={{ width: "100%", overflow: "auto", maxHeight: "600px" }}
                  >
                    {todoTasks.length > 0 ? (
                      todoTasks.map((task) => (
                        <ToDoObj
                          key={task.id}
                          task={task}
                          onMarkDone={markTaskAsDone}
                          onDelete={deleteTask}
                          onEdit={startEditingTask}
                        />
                      ))
                    ) : (
                      <Typography
                        color="text.secondary"
                        sx={{ p: 2, textAlign: "center" }}
                      >
                        No tasks to do. Add one above!
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>

              {/* Done Section */}
              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    height: "100%",
                    minHeight: "300px",
                  }}
                >
                  <Typography
                    variant="h5"
                    color="success.main"
                    sx={{ mb: 2, fontWeight: "bold" }}
                  >
                    DONE ({doneTasks.length})
                  </Typography>
                  <Stack
                    sx={{ width: "100%", overflow: "auto", maxHeight: "600px" }}
                  >
                    {doneTasks.length > 0 ? (
                      doneTasks.map((task) => (
                        <ToDoObj
                          key={task.id}
                          task={task}
                          onDelete={deleteTask}
                          onEdit={startEditingTask}
                        />
                      ))
                    ) : (
                      <Typography
                        color="text.secondary"
                        sx={{ p: 2, textAlign: "center" }}
                      >
                        No completed tasks yet.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default Todolist;
