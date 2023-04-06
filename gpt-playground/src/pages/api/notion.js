const { Client } = require("@notionhq/client")

/*
curl -X POST 'http://localhost:3000/api/notion' -d '{
    "notion_db_id": "YOUR_DB_ID_HERE",
    "notion_token": "YOUR_NOTION_AUTH_TOKEN_HERE",
    "text": "YOUR_TODO_ITEM_HERE"
}' -H 'content-type: application/json'
*/

// missing inputs
// incorrect inputs for all 3 inputs

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

    const response = await notion.pages.create({
      parent: {
        database_id: notion_db_id,
      },
      properties: {
        'Name': {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: text,
              },
            },
          ],
        }
      },
    });
    console.log(response);
  } catch (e) {
    // TODO: handle errors better than this
    res.status(400).json({ 'status': '400', 'data': 'something went wrong' })
  }


}