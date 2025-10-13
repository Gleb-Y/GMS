package com.gyurt.gms.api;

import com.gyurt.gms.dto.ApiResponse;
import com.gyurt.gms.repo.User;
import com.gyurt.gms.repo.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController implements UserApi{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<ApiResponse<User>> create(@Valid @RequestBody User user) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Email already in use", HttpStatus.BAD_REQUEST.value()));
            }
            // Hash password before saving
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(savedUser, "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Error creating user: " + e.getMessage(), 
                                     HttpStatus.BAD_REQUEST.value()));
        }
    }

    @Override
    public ResponseEntity<ApiResponse<User>> findByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
            .map(user -> ResponseEntity.ok(ApiResponse.success(user, "User found")))
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found with email: " + email, 
                                     HttpStatus.NOT_FOUND.value())));
    }

    @Override
    public ResponseEntity<ApiResponse<User>> update(@Valid @RequestBody User user) {
        return userRepository.findById(user.getId())
            .map(existingUser -> {
                user.setCreatedAt(existingUser.getCreatedAt());
                // Hash password if it was changed
                if (!user.getPassword().equals(existingUser.getPassword())) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                }
                User updatedUser = userRepository.save(user);
                return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found with id: " + user.getId(), 
                                     HttpStatus.NOT_FOUND.value())));
    }

    @Override
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.delete(user);
                return ResponseEntity
                    .<ApiResponse<Void>>ok(ApiResponse.success(null, "User deleted successfully"));
            })
            .orElseGet(() -> ResponseEntity
                .<ApiResponse<Void>>status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found with id: " + id, 
                                     HttpStatus.NOT_FOUND.value())));
    }
}
