const { Client } = require("@notionhq/client")
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const configuration = new Configuration({
  organization: 'org-JoyTBJ8CFCC0eUSQnlLSHDxK',
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);


/*
curl -X POST 'http://localhost:3000/api/notion' -d '{
    "notion_db_id": "YOUR_DB_ID_HERE",
    "notion_token": "YOUR_NOTION_AUTH_TOKEN_HERE",
    "text": "YOUR_TODO_ITEM_HERE"
}' -H 'content-type: application/json'
*/

// TODO: test for missing inputs
// TODO: test for incorrect inputs for all 3 inputs

function format_todo(notion_db_id, todoItem){
  console.log(todoItem)
  return {
    parent: {
      database_id: notion_db_id,
    },
    properties: {
      'title': {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: todoItem['toDoItem'],
            },
          },
        ],
      }
    },
  }
}


export default async function handler(req, res) {
  try {
    const {
      notion_db_id,
      notion_token,
      text
    } = req.body;
    console.log('req.body:', req.body);

    // Initializing a client
    const notion = new Client({
      auth: notion_token,
    })

    // Get ToDos from OpenAI
    let userMessage = `create one or more tasks for the following request: ${text}
    Only return a well structured JSON array: [{"toDoItem":"todo item"}]`
  
    console.log('OPEN AI KEY', process.env.OPENAI_API_KEY)
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{role: "system", content: "You are an executive assistant helping a user create todo tasks. "}, {role: "user", content: userMessage}],
    });

    let todos = JSON.parse(completion.data.choices[0].message.content.replace('\n',''))
    console.log('FORMATTED TODOS:', todos)

    const response = await Promise.all(
      todos.map(todo => notion.pages.create(format_todo(notion_db_id, todo)))
    ) 

    res.status(200).json({ 'status': '200', 'data': 'todo item uploaded' })
  } catch (e) {
    // TODO: handle errors better than this
    console.error(e);
    res.status(400).json({ 'status': '400', 'data': 'something went wrong' })
  }
}
