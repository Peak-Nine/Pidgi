# tickets.info

> Source: https://developer.focus.teamleader.eu/docs/api/tickets-info

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Tickets](/docs/api/tickets)
  * tickets.info



# tickets.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tickets.info

Get details for a single ticket.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**reference** number

**Example:**`123`

**subject** string

**status** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**assignee** objectnullable

Null if unassigned

**type** string

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**created_at** string

**Example:**`2017-05-09T11:25:11+00:00`

**closed_at** stringnullable

**Example:**`2017-05-09T11:25:11+00:00`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**participant** objectnullable

**customer** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**last_message_at** stringnullable

**Example:**`2017-05-09T11:25:11+00:00`

**description** string

**Example:**`My ticket details`

**project** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**milestone** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**custom_fields** object[]

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
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

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]



    
    
    {  
      "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
      "reference": 123,  
      "subject": "",  
      "status": {  
        "type": "ticketStatus",  
        "id": "aba0ad66-bf59-49fa-b546-45dcbc5e7e6e"  
      },  
      "assignee": {  
        "type": "user",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "created_at": "2017-05-09T11:25:11+00:00",  
      "closed_at": "2017-05-09T11:25:11+00:00",  
      "customer": {  
        "type": "contact",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "participant": {  
        "customer": {  
          "type": "company",  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
        }  
      },  
      "last_message_at": "2017-05-09T11:25:11+00:00",  
      "description": "My ticket details",  
      "project": {  
        "type": "project",  
        "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
      },  
      "milestone": {  
        "type": "milestone",  
        "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
      },  
      "custom_fields": [  
        {  
          "definition": {  
            "type": "customFieldDefinition",  
            "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
          },  
          "value": "092980616"  
        }  
      ]  
    }  
    
    
    
    {  
      "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
      "reference": 123,  
      "subject": "",  
      "status": {  
        "type": "ticketStatus",  
        "id": "aba0ad66-bf59-49fa-b546-45dcbc5e7e6e"  
      },  
      "assignee": {  
        "type": "user",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "created_at": "2017-05-09T11:25:11+00:00",  
      "closed_at": "2017-05-09T11:25:11+00:00",  
      "customer": {  
        "type": "contact",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "participant": {  
        "customer": {  
          "type": "company",  
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
        }  
      },  
      "last_message_at": "2017-05-09T11:25:11+00:00",  
      "description": "My ticket details",  
      "project": {  
        "type": "project",  
        "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
      },  
      "milestone": {  
        "type": "milestone",  
        "id": "32665afd-1818-0ed3-9e18-a603a3a21b95"  
      },  
      "custom_fields": [  
        {  
          "definition": {  
            "type": "customFieldDefinition",  
            "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
          },  
          "value": "092980616"  
        }  
      ]  
    }  
    

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tickets.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n}", null, "application/json");  
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
      "id": "f29abf48-337d-44b4-aad4-585f5277a456"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
