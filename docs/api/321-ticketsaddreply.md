# tickets.addReply

> Source: https://developer.focus.teamleader.eu/docs/api/tickets-add-reply

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Tickets](/docs/api/tickets)
  * tickets.addReply



# tickets.addReply
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tickets.addReply

Adds a message to a ticket.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**body** stringrequired

Uses HTML formatting

**Example:**`<p>Hello world</p>`

**ticket_status_id** string

**Example:**`46156648-87c6-478d-8aa7-1dc3a00dacab`

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tickets.addReply");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"body\": \"<p>Hello world</p>\",\n  \"ticket_status_id\": \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n  \"attachments\": [\n    \"4f4288b2-c21b-4dac-87f6-a97511309079\"\n  ]\n}", null, "application/json");  
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
      "ticket_status_id": "46156648-87c6-478d-8aa7-1dc3a00dacab",
      "attachments": [
        "4f4288b2-c21b-4dac-87f6-a97511309079"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
