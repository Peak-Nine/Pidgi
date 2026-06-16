# tasks.list

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-tasks-list

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Tasks](/docs/api/projects-v-2-tasks)
  * tasks.list



# tasks.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/tasks.list

Lists all the tasks that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

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

**id** string

**Example:**`39c64ba9-ebf1-491a-8486-a0b96ff21c07`

**project** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**group** objectnullable

If `null`, the task is not in any group.

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`nextgenProjectGroup`

**work_type** objectnullable

If null, the task does not have a specific work type.

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`workType`

**task_type** objectnullable

DEPRECATED - Use `work_type` instead.

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`workType`

**status** string

**Possible values:** [`to_do`, `in_progress`, `on_hold`, `done`]

**Example:**`in_progress`

**title** string

**Example:**`Write API documentation`

**billing_method** string

**Possible values:** [`user_rate`, `work_type_rate`, `custom_rate`, `fixed_price`, `parent_fixed_price`, `non_billable`]

**Example:**`user_rate`

**billing_status** BillingStatus (string)

**Possible values:** [`not_billable`, `not_billed`, `partially_billed`, `fully_billed`]

**Example:**`not_billable`

**custom_rate** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

Also known as "budget". Value set by user to compare with price.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget_spent** objectnullable

Simulated price if billing method were time_and_materials (dependent on type).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

Also known as "cost budget". Value set by user to compare with cost.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin_percentage** numbernullable

`null` if the user does not have access to "Costs on projects"

**assignees** object[]

  * Array [

**assignee** object

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**assign_type** string

**Possible values:** [`manual`]

**Example:**`manual`

  * ]

**start_date** stringnullable

**Example:**`2023-01-18`

**end_date** stringnullable

**Example:**`2023-03-22`

**time_estimated** objectnullable

Value in seconds, rounded to the nearest minute.

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**time_tracked** objectnullable

The total of all time tracked for this task.

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "eab232c6-49b2-4b7e-a977-5e1148dad471"  
          },  
          "work_type": {  
            "type": "workType",  
            "id": "0f517e20-2e76-4684-8d6c-3334f6d7148c"  
          },  
          "task_type": {  
            "type": "workType",  
            "id": "0f517e20-2e76-4684-8d6c-3334f6d7148c"  
          },  
          "status": "in_progress",  
          "title": "Write API documentation",  
          "billing_method": "user_rate",  
          "billing_status": "not_billable",  
          "custom_rate": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "manual"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "time_estimated": {  
            "value": 28800,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 21100,  
            "unit": "seconds"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "eab232c6-49b2-4b7e-a977-5e1148dad471"  
          },  
          "work_type": {  
            "type": "workType",  
            "id": "0f517e20-2e76-4684-8d6c-3334f6d7148c"  
          },  
          "task_type": {  
            "type": "workType",  
            "id": "0f517e20-2e76-4684-8d6c-3334f6d7148c"  
          },  
          "status": "in_progress",  
          "title": "Write API documentation",  
          "billing_method": "user_rate",  
          "billing_status": "not_billable",  
          "custom_rate": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "manual"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "time_estimated": {  
            "value": 28800,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 21100,  
            "unit": "seconds"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/tasks.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n      \"46156648-87c6-478d-8aa7-1dc3a00daca4\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
          "46156648-87c6-478d-8aa7-1dc3a00dacab",
          "46156648-87c6-478d-8aa7-1dc3a00daca4"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
