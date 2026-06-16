# tickets.importMessage

> Source: https://developer.focus.teamleader.eu/docs/api/tickets-import-message

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Tickets](/docs/api/tickets)
  * tickets.importMessage



# tickets.importMessage
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tickets.importMessage

Imports an existing message to a ticket.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**body** stringrequired

Uses HTML formatting

**Example:**`<p>Hello world</p>`

**sent_by** objectrequired

**type** stringrequired

**Possible values:** [`company`, `contact`, `user`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**sent_at** stringrequired

**Example:**`2024-02-29T11:11:11+00:00`

**attachments** string[]

All files must have the ticket as a subject




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "ticketMessage",  
        "id": "e3de4c0d-787d-4720-b78f-af8df5c8182c"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "ticketMessage",  
        "id": "e3de4c0d-787d-4720-b78f-af8df5c8182c"  
      }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tickets.importMessage");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"body\": \"<p>Hello world</p>\",\n  \"sent_by\": {\n    \"type\": \"contact\",\n    \"id\": \"4b3b07c6-a4bf-4c1b-9471-283fee71b049\"\n  },\n  \"sent_at\": \"2024-02-29T11:11:11+00:00\",\n  \"attachments\": [\n    \"4f4288b2-c21b-4dac-87f6-a97511309079\"\n  ]\n}", null, "application/json");  
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
      "body": "<p>Hello world</p>",
      "sent_by": {
        "type": "contact",
        "id": "4b3b07c6-a4bf-4c1b-9471-283fee71b049"
      },
      "sent_at": "2024-02-29T11:11:11+00:00",
      "attachments": [
        "4f4288b2-c21b-4dac-87f6-a97511309079"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
