# userAvailability.total

> Source: https://developer.focus.teamleader.eu/docs/api/user-availability-total

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [User availability](/docs/api/user-availability)
  * userAvailability.total



# userAvailability.total
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/userAvailability.total

Returns the total availability for all users.

## Request​

  * application/json



### Body**required**

**period** objectrequired

A maximum duration of 20.000 days can be passed

**start_date** string

**Default value:**`2023-10-02`

**end_date** string

**Default value:**`2023-10-06`

**filter** object

**assignees** object[]

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`user`

**availability** object

**gross_time_available** object

Total available time based on working hours

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**net_time_available** object

Gross time available minus days off

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**planned_time** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**unplanned_time** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

  * ]



    
    
    {  
      "data": [  
        {  
          "user": {  
            "type": "user",  
            "id": "1c00aeaa-0a47-0ce5-8f2b-60935c241f12"  
          },  
          "availability": {  
            "gross_time_available": {  
              "value": 480,  
              "unit": "minutes"  
            },  
            "net_time_available": {  
              "value": 480,  
              "unit": "minutes"  
            },  
            "planned_time": {  
              "value": 60,  
              "unit": "minutes"  
            },  
            "unplanned_time": {  
              "value": 420,  
              "unit": "minutes"  
            }  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "user": {  
            "type": "user",  
            "id": "1c00aeaa-0a47-0ce5-8f2b-60935c241f12"  
          },  
          "availability": {  
            "gross_time_available": {  
              "value": 480,  
              "unit": "minutes"  
            },  
            "net_time_available": {  
              "value": 480,  
              "unit": "minutes"  
            },  
            "planned_time": {  
              "value": 60,  
              "unit": "minutes"  
            },  
            "unplanned_time": {  
              "value": 420,  
              "unit": "minutes"  
            }  
          }  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/userAvailability.total");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"period\": {\n    \"start_date\": \"2024-01-01\",\n    \"end_date\": \"2024-01-07\"\n  }\n}", null, "application/json");  
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
      "period": {
        "start_date": "2024-01-01",
        "end_date": "2024-01-07"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
