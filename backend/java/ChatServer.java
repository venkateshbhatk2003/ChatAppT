import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import java.util.stream.Collectors;

public class ChatServer {

    static final String DB_URL = "jdbc:sqlserver://localhost:1433;databaseName=ChatAppT;trustServerCertificate=true";  // Corrected URL format
    static final String DB_USER = "chatAppAdmin";
    static final String DB_PASS = "venkatesh3002@galaxe";

    public static void main(String[] args) throws Exception {
        // Explicitly load the SQL Server JDBC driver
        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

        // Create the HTTP server
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/signup", ChatServer::handleSignup);
        server.createContext("/login", ChatServer::handleLogin);
        server.setExecutor(null);  // Default executor
        server.start();
        System.out.println("Server running on port 8080");
    }

    private static void handleSignup(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            return;
        }

        // Read request body
        String body = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                          .lines().collect(Collectors.joining(""));

        // Extract username and password from request body
        String[] parts = body.split("&");
        String username = parts[0].split("=")[1];
        String password = parts[1].split("=")[1];

        String response;
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Users (username, password) VALUES (?, ?)");
            stmt.setString(1, username);
            stmt.setString(2, password);
            stmt.executeUpdate();
            response = "Signup successful!";
            exchange.sendResponseHeaders(200, response.length());
        } catch (SQLException e) {
            response = "Signup failed: " + e.getMessage();
            exchange.sendResponseHeaders(500, response.length()); // Internal Server Error
        }

        // Send response
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    private static void handleLogin(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            return;
        }

        // Read request body
        String body = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                          .lines().collect(Collectors.joining(""));

        // Extract username and password from request body
        String[] parts = body.split("&");
        String username = parts[0].split("=")[1];
        String password = parts[1].split("=")[1];

        String response;
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Users WHERE username = ? AND password = ?");
            stmt.setString(1, username);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                response = "{\"username\": \"" + username + "\"}";
                exchange.sendResponseHeaders(200, response.length());
            } else {
                response = "Invalid credentials.";
                exchange.sendResponseHeaders(401, response.length()); // Unauthorized
            }

            
        } catch (SQLException e) {
            response = "Login failed: " + e.getMessage();
            exchange.sendResponseHeaders(500, response.length()); // Internal Server Error
        }

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }
}
