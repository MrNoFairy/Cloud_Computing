import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

public class DataUpload extends HttpServlet {

	DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("text/plain");
    response.setCharacterEncoding("UTF-8");

    response.getWriter().print("Hello App Engine!\r\n");

  }
  
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
	
      //read request
	BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(request.getInputStream()));
	String inputLine;
	StringBuffer inputBuffer = new StringBuffer();
	while ((inputLine = bufferedReader.readLine()) != null) {
		inputBuffer.append(inputLine);
	}
	bufferedReader.close();
	
	//parse Json
	 JSONObject myResponse = new JSONObject(inputBuffer.toString());
	
	 //build Meta Data
	 Entity e1 = new Entity("Stock Data", myResponse.getJSONObject("Meta Data").getString("Symbol"));
	 	e1.setProperty("LongitudeHeadquarter",myResponse.getJSONObject("Meta Data").getFloat("Longitude Headquarter"));
	 	e1.setProperty("LatitudeHeadquarter",myResponse.getJSONObject("Meta Data").getFloat("Latitude Headquarter"));

	 ds.put(e1);
	  
	 //load Stock Data
	 for (String keyStr :  myResponse.getJSONObject("Stock Data").keySet()) {   
	        
	  	 Entity e2 = new Entity(myResponse.getJSONObject("Meta Data").getString("Symbol"), keyStr);
	        
	  	 	e2.setProperty("day",keyStr);
	  	 	e2.setProperty("open",myResponse.getJSONObject("Stock Data").getJSONObject(keyStr).getString("open"));
	  	 	e2.setProperty("close",myResponse.getJSONObject("Stock Data").getJSONObject(keyStr).getString("close"));
	  	 	e2.setProperty("low",myResponse.getJSONObject("Stock Data").getJSONObject(keyStr).getString("low"));
	  	 	e2.setProperty("high",myResponse.getJSONObject("Stock Data").getJSONObject(keyStr).getString("high"));
	  	 	e2.setProperty("volume",myResponse.getJSONObject("Stock Data").getJSONObject(keyStr).getString("volume"));
	    	 	
	 ds.put(e2);

	 }
  }
  
  @Override
  public void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("text/plain");
    response.setCharacterEncoding("UTF-8");

    response.getWriter().print("Hello App Engine!\r\n");

  }
  
  @Override
  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("text/plain");
    response.setCharacterEncoding("UTF-8");

    response.getWriter().print("Hello App Engine!\r\n");

  }
}