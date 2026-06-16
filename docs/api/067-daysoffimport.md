# daysOff.import

> Source: https://developer.focus.teamleader.eu/docs/api/days-off-import

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Days Off](/docs/api/days-off)
  * daysOff.import



# daysOff.import
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/daysOff.import

Imports a list of days off for the given user.

## Request​

  * application/json



### Body**required**

**user_id** stringrequired

The id of the user that the days off belong to.

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**leave_type_id** stringrequired

The id of the leave type that is associated with the given days off.

**Example:**`0f517e20-2e76-4684-8d6c-3334f6d7148c`

**days** object[]required

At least one day must be present

  * Array [

**starts_at** stringrequired

**Example:**`2024-02-01T08:00:00+00:00`

**ends_at** stringrequired

**Example:**`2024-02-01T18:00:00+00:00`

  * ]




## Responses​

  * 201



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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/daysOff.import");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"user_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"leave_type_id\": \"0f517e20-2e76-4684-8d6c-3334f6d7148c\",\n  \"days\": [\n    {\n      \"starts_at\": \"2024-02-01T08:00:00+00:00\",\n      \"ends_at\": \"2024-02-01T18:00:00+00:00\"\n    }\n  ]\n}", null, "application/json");  
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
      "leave_type_id": "0f517e20-2e76-4684-8d6c-3334f6d7148c",
      "days": [
        {
          "starts_at": "2024-02-01T08:00:00+00:00",
          "ends_at": "2024-02-01T18:00:00+00:00"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
