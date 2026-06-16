# dayOffTypes.update

> Source: https://developer.focus.teamleader.eu/docs/api/day-off-types-update

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Day Off Types](/docs/api/day-off-types)
  * dayOffTypes.update



# dayOffTypes.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dayOffTypes.update

Update a day off type.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`1b7cece0-288c-0bbe-b916-5a315fbe9fe2`

**name** string

**Example:**`day off type`

**color** string

**Example:**`#00B2B2`

**date_validity** objectnullable

**from** stringrequired

**Example:**`2024-04-04`

**until** string

**Example:**`2025-05-05`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dayOffTypes.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"1b7cece0-288c-0bbe-b916-5a315fbe9fe2\",\n  \"name\": \"day off type\",\n  \"color\": \"#00B2B2\",\n  \"date_validity\": {\n    \"from\": \"2024-04-04\",\n    \"until\": \"2025-05-05\"\n  }\n}", null, "application/json");  
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
      "id": "1b7cece0-288c-0bbe-b916-5a315fbe9fe2",
      "name": "day off type",
      "color": "#00B2B2",
      "date_validity": {
        "from": "2024-04-04",
        "until": "2025-05-05"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
