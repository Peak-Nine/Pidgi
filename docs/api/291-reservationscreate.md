# reservations.create

> Source: https://developer.focus.teamleader.eu/docs/api/reservations-create

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Reservations](/docs/api/reservations)
  * reservations.create



# reservations.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/reservations.create

Create a new reservation.

## Request​

  * application/json



### Body**required**

**plannable_item_id** stringrequired

**Example:**`e82cec33-24c9-4d13-96cb-d515a1660c8d`

**date** stringrequired

**Example:**`2024-01-12`

**duration** objectrequired

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**assignee** objectrequired

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`




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
        "type": "reservation",  
        "id": "019a3012-c800-7109-ae63-0ab5bcd3b484"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "reservation",  
        "id": "019a3012-c800-7109-ae63-0ab5bcd3b484"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/reservations.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"plannable_item_id\": \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n  \"date\": \"2024-01-12\",\n  \"duration\": {\n    \"value\": 60,\n    \"unit\": \"minutes\"\n  },\n  \"assignee\": {\n    \"type\": \"user\",\n    \"id\": \"b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae\"\n  }\n}", null, "application/json");  
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
      "plannable_item_id": "46156648-87c6-478d-8aa7-1dc3a00dacab",
      "date": "2024-01-12",
      "duration": {
        "value": 60,
        "unit": "minutes"
      },
      "assignee": {
        "type": "user",
        "id": "b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
