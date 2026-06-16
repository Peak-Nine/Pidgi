# notes.update

> Source: https://developer.focus.teamleader.eu/docs/api/notes-update

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Notes](/docs/api/notes)
  * notes.update



# notes.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/notes.update

Update an existing note.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`36386b05-936e-4cc0-9523-bd20d797ebf5`

**content** string

**Example:**`new note content`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/notes.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"36386b05-936e-4cc0-9523-bd20d797ebf5\",\n  \"content\": \"new note content\"\n}", null, "application/json");  
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
      "id": "36386b05-936e-4cc0-9523-bd20d797ebf5",
      "content": "new note content"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
