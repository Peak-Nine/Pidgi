# notes.create

> Source: https://developer.focus.teamleader.eu/docs/api/notes-create

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Notes](/docs/api/notes)
  * notes.create



# notes.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/notes.create

Create a new note.

## Request​

  * application/json



### Body**required**

**subject** objectrequired

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** NoteSubjectTypes (string)required

**Possible values:** [`company`, `contact`, `creditNote`, `deal`, `invoice`, `nextgenProject`, `product`, `quotation`, `subscription`]

**content** stringrequired

**Example:**`new note content`

**notify** object[]

  * Array [

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`user`]

**Example:**`user`

  * ]




## Responses​

  * 201



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
        "type": "note",  
        "id": "ee94b4c0-5786-0517-9d26-8dd1e6406f20"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "note",  
        "id": "ee94b4c0-5786-0517-9d26-8dd1e6406f20"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/notes.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"subject\": {\n    \"type\": \"contact\",\n    \"id\": \"36386b05-936e-4cc0-9523-bd20d797ebf5\"\n  },\n  \"content\": \"new note content\",\n  \"notify\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    }\n  ]\n}", null, "application/json");  
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
      "subject": {
        "type": "contact",
        "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"
      },
      "content": "new note content",
      "notify": [
        {
          "type": "user",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
