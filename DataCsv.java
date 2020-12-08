import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
@SuppressWarnings("serial")


public class DataCsv extends HttpServlet {

	private DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		  Query q = new Query("Stock Data");
		
		  //Build Array with "fill info", out of Stock Data table
		  ArrayList<String[]> action = new ArrayList<String[]>();
			for (Entity entity : ds.prepare(q).asIterable()) {
				
				action.add(new String[]{entity.getKey().getName(),
						entity.getProperty("LatitudeHeadquarter").toString(),
						entity.getProperty("LongitudeHeadquarter").toString()				
				});
			}			
			
			//build output String
			String data = "Symbol,Latitude Headquater,Longitude Headquater,Day,close,high,low,open,volume\n";
			
			for (String[] temp : action) {
				Query qu = new Query(temp[0]);
				for (Entity entity : ds.prepare(qu).asIterable()) {
					data = data + 
							temp[0]+","+ 
							temp[1]+","+
							temp[2]+","+
							entity.getKey().getName()+"," +
							entity.getProperty("close").toString()+","+
							entity.getProperty("high").toString()+","+
							entity.getProperty("low").toString()+","+
							entity.getProperty("open").toString()+","+
							entity.getProperty("volume").toString()+"\n";
				}
			}

		//output csv String
		  response.addHeader("Content-Disposition", "attachment; filename=\"Stock Data.csv\"");

		response.setContentType("text/plain");
		response.getWriter().write(data);
		response.getWriter().close();
	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}