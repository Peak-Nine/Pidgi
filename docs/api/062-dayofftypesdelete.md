# dayOffTypes.delete

> Source: https://developer.focus.teamleader.eu/docs/api/day-off-types-delete

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Day Off Types](/docs/api/day-off-types)
  * dayOffTypes.delete



# dayOffTypes.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dayOffTypes.delete

Delete a day off type.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`1b7cece0-288c-0bbe-b916-5a315fbe9fe2`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dayOffTypes.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"1b7cece0-288c-0bbe-b916-5a315fbe9fe2\"\n}", null, "application/json");  
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
      "id": "1b7cece0-288c-0bbe-b916-5a315fbe9fe2"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
