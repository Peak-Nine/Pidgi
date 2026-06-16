# files.delete

> Source: https://developer.focus.teamleader.eu/docs/api/files-delete

  * [](/)
  * [API Reference](/docs/api)
  * Files
  * [Files](/docs/api/files)
  * files.delete



# files.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/files.delete

Delete a file.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/files.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb\"\n}", null, "application/json");  
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
      "id": "4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
