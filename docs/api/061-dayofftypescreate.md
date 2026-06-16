# dayOffTypes.create

> Source: https://developer.focus.teamleader.eu/docs/api/day-off-types-create

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Day Off Types](/docs/api/day-off-types)
  * dayOffTypes.create



# dayOffTypes.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dayOffTypes.create

Create a new day off type.

## Request​

  * application/json



### Body**required**

**name** stringrequired

**Example:**`day off type`

**color** stringnullable

**Example:**`#00B2B2`

**date_validity** objectnullable

**from** stringrequired

**Example:**`2024-04-04`

**until** string

**Example:**`2025-05-05`




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
        "type": "dayOffType",  
        "id": "cf307a90-d778-003c-b820-ab8415d1a524"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "dayOffType",  
        "id": "cf307a90-d778-003c-b820-ab8415d1a524"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dayOffTypes.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"name\": \"day off type\",\n  \"color\": \"#00B2B2\",\n  \"date_validity\": {\n    \"from\": \"2024-04-04\",\n    \"until\": \"2025-05-05\"\n  }\n}", null, "application/json");  
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
