# milestones.create

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-milestones-create

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Milestones](/docs/api/legacy-milestones)
  * milestones.create



# milestones.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/milestones.create

Create a new milestone.

## Request​

  * application/json



### Body**required**

oneOf

    * With budget
    * With price

**billing_method** string

**Possible values:** [`non_invoiceable`, `time_and_materials`]

**Default value:**`time_and_materials`

**budget** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**billing_method** stringrequired

**Example:**`fixed_price`

**price** objectrequired

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**project_id** stringrequired

**Example:**`1c159f98-4b07-438a-9f42-fb4206b9530d`

**starts_on** stringnullable

**Example:**`2017-01-01`

**due_on** stringrequired

**Example:**`2018-01-01`

**name** stringrequired

**Example:**`Initial setup`

**description** string

**responsible_user_id** stringrequired

**Example:**`e1240972-6cfc-4549-b49c-edda7568cc48`

**depends_on** stringnullable

**Example:**`0488d792-ba9b-059f-bd57-bea75d3f4f4e`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]




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
        "type": "milestone",  
        "id": "51f19f91-6343-4001-a628-3afe45f674ad"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "milestone",  
        "id": "51f19f91-6343-4001-a628-3afe45f674ad"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/milestones.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"1c159f98-4b07-438a-9f42-fb4206b9530d\",\n  \"starts_on\": \"2017-01-01\",\n  \"due_on\": \"2018-01-01\",\n  \"name\": \"Initial setup\",\n  \"responsible_user_id\": \"e1240972-6cfc-4549-b49c-edda7568cc48\",\n  \"billing_method\": \"time_and_materials\",\n  \"budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"depends_on\": \"0488d792-ba9b-059f-bd57-bea75d3f4f4e\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
      "project_id": "1c159f98-4b07-438a-9f42-fb4206b9530d",
      "starts_on": "2017-01-01",
      "due_on": "2018-01-01",
      "name": "Initial setup",
      "responsible_user_id": "e1240972-6cfc-4549-b49c-edda7568cc48",
      "billing_method": "time_and_materials",
      "budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "depends_on": "0488d792-ba9b-059f-bd57-bea75d3f4f4e",
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
