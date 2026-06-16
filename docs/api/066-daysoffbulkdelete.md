# daysOff.bulkDelete

> Source: https://developer.focus.teamleader.eu/docs/api/days-off-bulk-delete

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Days Off](/docs/api/days-off)
  * daysOff.bulkDelete



# daysOff.bulkDelete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/daysOff.bulkDelete

Deletes a list of days off for the given user.

## Request​

  * application/json



### Body**required**

**user_id** stringrequired

The id of the user that the days off belong to.

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**ids** string[]

At least one day off id must be present.




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/daysOff.bulkDelete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"user_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"ids\": [\n    \"0a481ce9-0d2a-0913-9439-0fd8b469b566\",\n    \"5050789e-4385-02f6-bd3c-d051cc12f5cf\"\n  ]\n}", null, "application/json");  
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
      "user_id": "f29abf48-337d-44b4-aad4-585f5277a456",
      "ids": [
        "0a481ce9-0d2a-0913-9439-0fd8b469b566",
        "5050789e-4385-02f6-bd3c-d051cc12f5cf"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
