# tickets.getMessage

> Source: https://developer.focus.teamleader.eu/docs/api/tickets-get-message

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Tickets](/docs/api/tickets)
  * tickets.getMessage



# tickets.getMessage
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tickets.getMessage

Gets the ticket message.

## Request​

  * application/json



### Body**required**

**message_id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**message_id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**body** string

Uses HTML formatting

**Example:**`<p>This is a message</p>`

**raw_body** string

Uses HTML formatting

**Example:**`<p>This is a message</p>`

**created_at** string

**Example:**`2017-05-09T11:25:11+00:00`

**sent_by** object

**type** string

**Possible values:** [`company`, `contact`, `user`]

**Example:**`contact`

**id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**ticket** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**attachments** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**type** string

**Possible values:** [`customer`, `internal`, `thirdParty`]

**Example:**`customer`



    
    
    {  
      "message_id": "f29abf48-337d-44b4-aad4-585f5277a456",  
      "body": "<p>This is a message</p>",  
      "raw_body": "<p>This is a message</p>",  
      "created_at": "2017-05-09T11:25:11+00:00",  
      "sent_by": {  
        "type": "contact",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "ticket": {  
        "type": "ticket",  
        "id": "4f5c4ee1-9078-0eda-8817-03e4cba61bab"  
      },  
      "attachments": [  
        {  
          "type": "file",  
          "id": "0686d0da-1797-475b-ae94-27191b2eca4d"  
        }  
      ],  
      "type": "customer"  
    }  
    
    
    
    {  
      "message_id": "f29abf48-337d-44b4-aad4-585f5277a456",  
      "body": "<p>This is a message</p>",  
      "raw_body": "<p>This is a message</p>",  
      "created_at": "2017-05-09T11:25:11+00:00",  
      "sent_by": {  
        "type": "contact",  
        "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
      },  
      "ticket": {  
        "type": "ticket",  
        "id": "4f5c4ee1-9078-0eda-8817-03e4cba61bab"  
      },  
      "attachments": [  
        {  
          "type": "file",  
          "id": "0686d0da-1797-475b-ae94-27191b2eca4d"  
        }  
      ],  
      "type": "customer"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tickets.getMessage");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"message_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n}", null, "application/json");  
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
      "message_id": "f29abf48-337d-44b4-aad4-585f5277a456"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
