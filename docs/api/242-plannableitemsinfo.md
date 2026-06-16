# plannableItems.info

> Source: https://developer.focus.teamleader.eu/docs/api/plannable-items-info

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Plannable items](/docs/api/plannable-items)
  * plannableItems.info



# plannableItems.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/plannableItems.info

Returns the info for a single plannable item, either by ID or source if the ID is unknown.

## Request​

  * application/json



### Body**required**

**id** string

**Example:**`018d79a1-2b99-7fbd-b323-500b01305371`

**source** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`task`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`018d55af-d0d7-76be-8185-ee970a7f3826`

**source** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`task`

**total_duration** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**planned_duration** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**unplanned_duration** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`



    
    
    {  
      "data": {  
        "id": "018d79a1-2b99-7fbd-b323-500b01305371",  
        "source": {  
          "type": "task",  
          "id": "948b8ca5-58aa-0844-ba34-cee255aa9694"  
        },  
        "total_duration": {  
          "value": 600,  
          "currency": "minutes"  
        },  
        "planned_duration": {  
          "value": 600,  
          "currency": "minutes"  
        },  
        "unplanned_duration": {  
          "value": 0,  
          "currency": "minutes"  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "018d79a1-2b99-7fbd-b323-500b01305371",  
        "source": {  
          "type": "task",  
          "id": "948b8ca5-58aa-0844-ba34-cee255aa9694"  
        },  
        "total_duration": {  
          "value": 600,  
          "currency": "minutes"  
        },  
        "planned_duration": {  
          "value": 600,  
          "currency": "minutes"  
        },  
        "unplanned_duration": {  
          "value": 0,  
          "currency": "minutes"  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/plannableItems.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"018d79a1-2b99-7fbd-b323-500b01305371\"\n}", null, "application/json");  
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
      "id": "018d79a1-2b99-7fbd-b323-500b01305371"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
