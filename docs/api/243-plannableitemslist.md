# plannableItems.list

> Source: https://developer.focus.teamleader.eu/docs/api/plannable-items-list

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Plannable items](/docs/api/plannable-items)
  * plannableItems.list



# plannableItems.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/plannableItems.list

Lists all plannable items that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**status** string[]

**Possible values:** [`active`, `deactivated`]

**term** string

**Example:**`Set-up`

**start_date** string

**Example:**`2023-10-02`

**end_date** string

**Example:**`2023-10-06`

**project_ids** string[]

**assignees** object[]

To fetch unassigned plannable items, provide `null` instead of the type/id object

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]

**work_type_ids** string[]

**completion_statuses** string[]

**Possible values:** [`to_do`, `done`]

**planned_time_statuses** string[]

**Possible values:** [`unplanned`, `partially_planned`, `fully_planned`, `overbooked`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`id`, `end_date`, `total_duration`]

**Default value:**`id`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`asc`

  * ]




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

  * ]



    
    
    {  
      "data": [  
        {  
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
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/plannableItems.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"018d79a1-2b99-7fbd-b323-500b01305371\"\n    ]\n  }\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "018d79a1-2b99-7fbd-b323-500b01305371"
        ]
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
