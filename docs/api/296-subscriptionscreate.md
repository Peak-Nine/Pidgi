# subscriptions.create

> Source: https://developer.focus.teamleader.eu/docs/api/subscriptions-create

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Subscriptions](/docs/api/subscriptions)
  * subscriptions.create



# subscriptions.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/subscriptions.create

Create a new subscription.

## Request​

  * application/json



### Body**required**

**invoicee** objectrequired

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**for_attention_of** object

oneOf

    * By Name
    * By Contact Id

**name** stringrequired

**Example:**`Finance Dept.`

**contact_id** stringrequired

**Example:**`417a2231-c3c7-4e1c-a6bb-1b014836ca60`

**department_id** stringrequired

**Example:**`6a6343fc-fdd8-4bc0-aa69-3a004c710e87`

**starts_on** stringrequired

**Example:**`2022-04-26`

**billing_cycle** objectrequired

**periodicity** objectrequired

oneOf

    * By Week
    * By Month
    * By Year

**unit** stringrequired

**Possible values:** [`week`]

**Example:**`week`

**period** numberrequired

**Possible values:** [`1`, `2`]

**Example:**`2`

**unit** stringrequired

**Possible values:** [`month`]

**Example:**`month`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `6`]

**Example:**`4`

**unit** stringrequired

**Possible values:** [`year`]

**Example:**`year`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`]

**Example:**`7`

**days_in_advance** integerrequired

**Possible values:** [`0`, `7`, `14`, `21`, `28`]

**Example:**`7`

**title** stringrequired

**Example:**`Subscription for cookies`

**grouped_lines** object[]required

  * Array [

**section** object

**title** string

**line_items** object[]required

  * Array [

**quantity** numberrequired

**Example:**`3`

**description** stringrequired

**Example:**`An awesome product`

**extended_description** stringnullable

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**unit_price** objectrequired

**amount** numberrequired

**Example:**`123.3`

**tax** stringrequired

**Possible values:** [`excluding`]

**Example:**`excluding`

**tax_rate_id** stringrequired

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585823`

**discount** object

**value** numberrequired

**Example:**`10`

**type** stringrequired

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**product_id** string

**Example:**`d905ff57-e866-0f59-9d1e-1fd4538bfae1`

**withholding_tax_rate_id** string

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585824`

**product_category_id** string

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`

  * ]

  * ]

**ends_on** stringnullable

**Example:**`2022-05-26`

**deal_id** string

**Example:**`cef01135-7e51-4f6f-a6eb-6e5e5a885ac8`

**project_id** string

**Example:**`ebafa4c5-fa8a-4409-92e5-1b192243372f`

**note** string

**Example:**`Subscription comments`

**payment_term** objectrequired

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**invoice_generation** objectrequired

oneOf

    * With action draft
    * With action book
    * With action & sending_methods

**action** stringrequired

**Example:**`draft`

**payment_method** string

**Possible values:** [`direct_debit`]

**action** stringrequired

**Example:**`book`

**payment_method** string

**Possible values:** [`direct_debit`]

**action** stringrequired

**Example:**`book_and_send`

**sending_methods** object[]required

Only provided when action is "book and send".

  * Array [

**method** stringrequired

**Possible values:** [`email`, `peppol`, `postal_service`]

**Example:**`email`

  * ]

**payment_method** string

**Possible values:** [`direct_debit`]

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

**document_template_id** string

**Example:**`179e1564-493b-4305-8c54-a34fc80920fc`




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
        "type": "subscription",  
        "id": "e2314517-3cab-4aa9-8471-450e73449041"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "subscription",  
        "id": "e2314517-3cab-4aa9-8471-450e73449041"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/subscriptions.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"invoicee\": {\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    },\n    \"for_attention_of\": {\n      \"name\": \"Finance Dept.\"\n    }\n  },\n  \"department_id\": \"6a6343fc-fdd8-4bc0-aa69-3a004c710e87\",\n  \"starts_on\": \"2022-04-26\",\n  \"billing_cycle\": {\n    \"periodicity\": {\n      \"unit\": \"week\",\n      \"period\": 2\n    },\n    \"days_in_advance\": 7\n  },\n  \"title\": \"Subscription for cookies\",\n  \"grouped_lines\": [\n    {\n      \"section\": {\n        \"title\": \"string\"\n      },\n      \"line_items\": [\n        {\n          \"quantity\": 3,\n          \"description\": \"An awesome product\",\n          \"extended_description\": \"Some more information about this awesome product\",\n          \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n          \"unit_price\": {\n            \"amount\": 123.3,\n            \"tax\": \"excluding\"\n          },\n          \"tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585823\",\n          \"discount\": {\n            \"value\": 10,\n            \"type\": \"percentage\"\n          },\n          \"product_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n          \"withholding_tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585824\",\n          \"product_category_id\": \"e2314517-3cab-4aa9-8471-450e73449041\"\n        }\n      ]\n    }\n  ],\n  \"ends_on\": \"2022-05-26\",\n  \"deal_id\": \"cef01135-7e51-4f6f-a6eb-6e5e5a885ac8\",\n  \"project_id\": \"ebafa4c5-fa8a-4409-92e5-1b192243372f\",\n  \"note\": \"Subscription comments\",\n  \"payment_term\": {\n    \"type\": \"cash\",\n    \"days\": 0\n  },\n  \"invoice_generation\": {\n    \"action\": \"draft\",\n    \"payment_method\": \"direct_debit\"\n  },\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"document_template_id\": \"179e1564-493b-4305-8c54-a34fc80920fc\"\n}", null, "application/json");  
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
    
    
    {
      "invoicee": {
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        },
        "for_attention_of": {
          "name": "Finance Dept."
        }
      },
      "department_id": "6a6343fc-fdd8-4bc0-aa69-3a004c710e87",
      "starts_on": "2022-04-26",
      "billing_cycle": {
        "periodicity": {
          "unit": "week",
          "period": 2
        },
        "days_in_advance": 7
      },
      "title": "Subscription for cookies",
      "grouped_lines": [
        {
          "section": {
            "title": "string"
          },
          "line_items": [
            {
              "quantity": 3,
              "description": "An awesome product",
              "extended_description": "Some more information about this awesome product",
              "unit_of_measure_id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71",
              "unit_price": {
                "amount": 123.3,
                "tax": "excluding"
              },
              "tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585823",
              "discount": {
                "value": 10,
                "type": "percentage"
              },
              "product_id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",
              "withholding_tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585824",
              "product_category_id": "e2314517-3cab-4aa9-8471-450e73449041"
            }
          ]
        }
      ],
      "ends_on": "2022-05-26",
      "deal_id": "cef01135-7e51-4f6f-a6eb-6e5e5a885ac8",
      "project_id": "ebafa4c5-fa8a-4409-92e5-1b192243372f",
      "note": "Subscription comments",
      "payment_term": {
        "type": "cash",
        "days": 0
      },
      "invoice_generation": {
        "action": "draft",
        "payment_method": "direct_debit"
      },
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ],
      "document_template_id": "179e1564-493b-4305-8c54-a34fc80920fc"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
