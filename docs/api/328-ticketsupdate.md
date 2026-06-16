# tickets.update

> Source: https://developer.focus.teamleader.eu/docs/api/tickets-update

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Tickets](/docs/api/tickets)
  * tickets.update



# tickets.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tickets.update

Update a ticket.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**subject** string

**Example:**`My ticket subject`

**description** string

Uses Markdown formatting

**Example:**`My ticket details`

**ticket_status_id** string

**Example:**`46156648-87c6-478d-8aa7-1dc3a00dacab`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**assignee** objectnullable

**type** stringrequired

**Possible values:** [`user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**participant** objectnullable

**customer** objectnullablerequired

**type** stringrequired

**Possible values:** [`company`]

**Example:**`company`

**id** stringrequired

**Example:**`2659dc4d-444b-4ced-b51c-b87591f604d7`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**milestone_id** stringnullable

**Example:**`32665afd-1818-0ed3-9e18-a603a3a21b95`




## Responses​

  * 204



**Response Headers**




#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tickets.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"subject\": \"My ticket subject\",\n  \"description\": \"My ticket details\",\n  \"ticket_status_id\": \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n  \"customer\": {\n    \"type\": \"company\",\n    \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n  },\n  \"assignee\": {\n    \"type\": \"user\",\n    \"id\": \"98b2863e-7b01-4232-82f5-ede1f0b9db22\"\n  },\n  \"participant\": {\n    \"customer\": {\n      \"type\": \"company\",\n      \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n    }\n  },\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"milestone_id\": \"32665afd-1818-0ed3-9e18-a603a3a21b95\"\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required

  * Example (from schema)
  * Example


    
    
    {
      "id": "f29abf48-337d-44b4-aad4-585f5277a456",
      "subject": "My ticket subject",
      "description": "My ticket details",
      "ticket_status_id": "46156648-87c6-478d-8aa7-1dc3a00dacab",
      "customer": {
        "type": "company",
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"
      },
      "assignee": {
        "type": "user",
        "id": "98b2863e-7b01-4232-82f5-ede1f0b9db22"
      },
      "participant": {
        "customer": {
          "type": "company",
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
        }
      },
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ],
      "milestone_id": "32665afd-1818-0ed3-9e18-a603a3a21b95"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
