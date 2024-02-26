const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// sample data
let todos = [
  { id: 1, name: 'Sample Todo 1', completed: false, date: '2024-02-01T12:00:00.000Z', priority: 'Normal' },
  { id: 2, name: 'Sample Todo 2', completed: true, date: '2024-02-02T12:00:00.000Z', priority: 'High' },
  { id: 3, name: 'Sample Todo 3', completed: false, date: '2024-02-03T12:00:00.000Z', priority: 'Low' },
];

// GraphQL schema
const schema = buildSchema(`
  enum Priority {
    High
    Normal
    Low
  }

  type Todo {
    id: Int
    name: String
    completed: Boolean
    date: String
    priority: Priority
  }

  type Query {
    getAllTodos: [Todo]
    getTodo(id: Int!): Todo
    getCompletedTodos: [Todo]
    getNotCompletedTodos: [Todo]
  }

  type Mutation {
    addTodo(name: String!, priority: Priority): Todo
    completeTodo(id: Int!): Todo
    setPriority(id: Int!, priority: Priority): Todo
  }
`);

// resolvers
const resolvers = {
  getAllTodos: () => todos,
  getTodo: ({ id }) => todos.find(todo => todo.id === id),
  getCompletedTodos: () => todos.filter(todo => todo.completed),
  getNotCompletedTodos: () => todos.filter(todo => !todo.completed),
  addTodo: ({ name, priority = 'Normal' }) => {
    const newTodo = { id: todos.length + 1, name, completed: false, date: new Date().toISOString(), priority };
    todos.push(newTodo);
    return newTodo;
  },
  completeTodo: ({ id }) => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      todos[todoIndex].completed = true;
      return todos[todoIndex];
    }
    return null;
  },
  setPriority: ({ id, priority }) => {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      todos[todoIndex].priority = priority;
      return todos[todoIndex];
    }
    return null;
  },
};

// create and express app
const app = express();
app.use('/graphql', graphqlHTTP({ schema, rootValue: resolvers, graphiql: true }));

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});

// test queries:
// Query 1: Display the priority when you list todos
// query DisplayPriority {
//   getAllTodos {
//     id
//     name
//     completed
//     date
//     priority
//   }
// }

// Query 2: Set the "Complete final assessment" todo to "High" priority
// mutation SetPriority {
//   setPriority(id: 1, priority: High) {
//     id
//     name
//     priority
//   }
// }

// Query 3: Sort todos by priority
// query SortTodosByPriority {
//   getAllTodos {
//     id
//     name
//     completed
//     date
//     priority
//   }
// }