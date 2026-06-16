# calls.complete

> Source: https://developer.focus.teamleader.eu/docs/api/calls-complete

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calls](/docs/api/calls)
  * calls.complete



# calls.complete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/calls.complete

Mark a call as complete.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`

**call_outcome_id** string

**Example:**`2b43633b-22d1-41b6-b87b-e1fd742325d4`

**outcome_summary** string

**Example:**`Called, but was not available`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/calls.complete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"6fac0bf0-e803-424e-af67-76863a3d7d16\",\n  \"call_outcome_id\": \"2b43633b-22d1-41b6-b87b-e1fd742325d4\",\n  \"outcome_summary\": \"Called, but was not available\"\n}", null, "application/json");  
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
      "id": "6fac0bf0-e803-424e-af67-76863a3d7d16",
      "call_outcome_id": "2b43633b-22d1-41b6-b87b-e1fd742325d4",
      "outcome_summary": "Called, but was not available"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
